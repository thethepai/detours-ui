#define _CRT_SECURE_NO_WARNINGS
#define WIN32_LEAN_AND_MEAN
#include<windows.h>
#include<iostream>
#include<cstdio>
#include<detours.h>
#pragma comment(lib,"detours.lib")

// websocket通讯使用
#include <boost/asio/ip/tcp.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <nlohmann/json.hpp>
#include <string>

using tcp = boost::asio::ip::tcp;
namespace websocket = boost::beast::websocket;
using json = nlohmann::json;

int main()
{
    STARTUPINFO si;
    PROCESS_INFORMATION pi;
    ZeroMemory(&si, sizeof(STARTUPINFO));
    ZeroMemory(&pi, sizeof(PROCESS_INFORMATION));
    si.cb = sizeof(STARTUPINFO);
    WCHAR DirPath[MAX_PATH + 1];
    WCHAR EXE[MAX_PATH + 1] = { 0 };
    char DLLPath[MAX_PATH + 1];
    
    try {
        // 创建一个io_context对象（1个线程），同时创建tcp接受器
        boost::asio::io_context ioc{ 1 };
        tcp::acceptor acceptor{ ioc, { tcp::v4(), 8111 } };
        for (;;) {
            // 创建一个tcp套接字，接受器接受传入的连接，建立tcp连接
            tcp::socket socket{ ioc };
            acceptor.accept(socket);

            // 创建一个websocket流并且完成握手，建立websocket连接
            websocket::stream<tcp::socket> ws{ std::move(socket) };
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
                }
                else if (received_text == "stop hook") {
                   std::cout << "Stop hook command received." << std::endl;
                   // 结束hook的逻辑
                   ws.close(websocket::close_code::normal);
                   break;
                }

                // 打印并处理前端发来的data数据
                json received_json = json::parse(received_text);
                std::cout << "Received message from client: " << received_json.dump() << std::endl;

                if (received_json.contains("exePath")) {
                   std::cout << "dirPath field exists in the received JSON." << std::endl;       

                   std::string dirPath_str = received_json["hookPath"].get<std::string>();
                   std::wstring dirPath(dirPath_str.begin(), dirPath_str.end());
                   wcscpy_s(DirPath, MAX_PATH, dirPath.c_str()); // DLL的文件夹

                   std::string dllPath_str = received_json["hookPath_dll"].get<std::string>();
                   strncpy(DLLPath, dllPath_str.c_str(), MAX_PATH); // dll的地址

                   std::string exePath_str = received_json["exePath"].get<std::string>();
                   std::wstring exePath(exePath_str.begin(), exePath_str.end());
                   wcscpy_s(EXE, MAX_PATH, exePath.c_str()); // 注入程序的地址

                   if (DetourCreateProcessWithDllEx(EXE, NULL, NULL, NULL, TRUE, CREATE_DEFAULT_ERROR_MODE | CREATE_SUSPENDED, NULL, DirPath, &si, &pi, DLLPath, NULL))
                   {   
                       ResumeThread(pi.hThread);
                       WaitForSingleObject(pi.hProcess, INFINITE);
                   }
                   else
                   {
                       char error[100];
                       sprintf_s(error, "%d", GetLastError());
                   }
                }
            }
        }
    }
    catch (std::exception const& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}