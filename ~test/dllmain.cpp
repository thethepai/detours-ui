#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <cstdlib>
#include <iostream>
#include <string>
#include <nlohmann/json.hpp>

using json = nlohmann::json;
using tcp = boost::asio::ip::tcp;
namespace websocket = boost::beast::websocket;

BOOL APIENTRY DllMain( HMODULE hModule,
                       DWORD  ul_reason_for_call,
                       LPVOID lpReserved
                     )
{
    BOOL bRet;
    json info,infoEnd;
    struct _stat buf;

    TCHAR exeFullName[MAX_PATH];
    GetModuleFileName(NULL, exeFullName, MAX_PATH);
    currentFileName = CW2A(exeFullName);

    TCHAR exeFullPath[MAX_PATH];
    GetCurrentDirectory(MAX_PATH,exeFullPath);
    currentWorkDir = CW2A(exeFullPath);

    // Create a WebSocket connection
    boost::asio::io_context ioc;
    tcp::resolver resolver{ioc};
    websocket::stream<tcp::socket> ws{ioc};

    auto const results = resolver.resolve("localhost", "8080");
    boost::asio::connect(ws.next_layer(), results.begin(), results.end());
    ws.handshake("localhost", "/");

    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
        DisableThreadLibraryCalls(hModule);
        DetourTransactionBegin();
        DetourUpdateThread(GetCurrentThread());

        info["Operation"] = "StartTrace";
        info["DefaultHeap"] = int(GetProcessHeap());
        if (_stat(currentFileName.c_str(), &buf) == 0) {
            info["st_size"] = buf.st_size;
            info["st_atime"] = buf.st_atime;
            info["st_mtime"] = buf.st_mtime;
            info["st_ctime"] = buf.st_ctime;
        }

        // Send message through WebSocket
        ws.write(boost::asio::buffer(std::string(info.dump())));

        EnableDetours();
        break;
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
    case DLL_PROCESS_DETACH:
        DisableDetours();

        infoEnd["Operation"] = "StopTrace";

        // Send message through WebSocket
        ws.write(boost::asio::buffer(std::string(infoEnd.dump())));

        // Close WebSocket connection
        ws.close(websocket::close_code::normal);
        break;
    }
    return TRUE;
}