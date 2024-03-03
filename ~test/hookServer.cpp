#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <nlohmann/json.hpp>
#include <string>
#include <iostream>

using tcp = boost::asio::ip::tcp;
namespace websocket = boost::beast::websocket;
using json = nlohmann::json;

int main() {
    try {
        boost::asio::io_context ioc{1};
        tcp::acceptor acceptor{ioc, {tcp::v4(), 8111}};

        for (;;) {
            tcp::socket socket{ioc};
            acceptor.accept(socket);

            websocket::stream<tcp::socket> ws{std::move(socket)};
            ws.accept();

            while (ws.is_open()) {
                boost::beast::multi_buffer buffer;
                ws.read(buffer);

                auto received_text = boost::beast::buffers_to_string(buffer.data());

                if (received_text == "start hook") {
                    std::cout << "Start hook command received." << std::endl;
                    // 开始hook的逻辑
                    continue;
                } else if (received_text == "stop hook") {
                    std::cout << "Stop hook command received." << std::endl;
                    // 结束hook的逻辑
                    ws.close(websocket::close_code::normal);
                    break;
                }

                json received_json = json::parse(received_text);

                // 打印前端发来的data数据
                std::cout << "Received message from client: " << received_json.dump() << std::endl;

                json response_json;
                response_json["name"] = "memcpy";
                response_json["EXE"] = {{"size", "1024"}, {"drive", "C:"}};
                response_json["thread"] = {{"id", "1"}, {"handle", "handle1"}};

                std::string response_text = response_json.dump();
                ws.write(boost::asio::buffer(std::move(response_text)));
            }
        }
    } catch (std::exception const& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}