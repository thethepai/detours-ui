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
        // 创建一个io_context对象（1个线程），同时创建tcp接受器
        boost::asio::io_context ioc{1};
        tcp::acceptor acceptor{ioc, {tcp::v4(), 8111}};

        for (;;) {
            // 创建一个tcp套接字，接受器接受传入的连接，建立tcp连接
            tcp::socket socket{ioc};
            acceptor.accept(socket);

            // 创建一个websocket流并且完成握手，建立websocket连接
            websocket::stream<tcp::socket> ws{std::move(socket)};
            ws.accept();

            // 一直读取数据
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

                // 向前端发送数据示例
                json response_json;
                response_json["name"] = "test1";
                response_json["id"] = "U202112003";
                response_json["priority"] = "high";
                response_json["EXE"] = {{"size", "1024"}, {"drive", "C:"}};
                response_json["thread"] = {{"id", "1"}, {"handle", "handle1"}};
                response_json["OUTPUT"] = {{"output1", "111"}, {"output2", "222"}};

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