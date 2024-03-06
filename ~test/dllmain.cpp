// dllmain.cpp : 定义 DLL 应用程序的入口点。
#include "Windows.h"
#include "detours.h"
#include "framework.h"
#include "pch.h"
#include "stdio.h"
#include <Psapi.h>
#include <iostream>
#include <nlohmann/json.hpp>
#include <string>

#pragma comment(lib, "detours.lib")

using json = nlohmann::json;

// DLL中创建命名管道
HANDLE hPipe = CreateNamedPipe(
    L"\\\\.\\pipe\\MyPipe", // 管道名称
    PIPE_ACCESS_DUPLEX, // 双向管道
    PIPE_TYPE_BYTE | PIPE_READMODE_BYTE | PIPE_WAIT, // 字节类型，字节读取模式，阻塞模式
    PIPE_UNLIMITED_INSTANCES, // 无限实例
    1024, 1024, // 输出缓冲区大小，输入缓冲区大小
    0, // 默认客户端超时
    NULL); // 默认安全属性

SYSTEMTIME st;

static int(WINAPI* OldMessageBoxW)(_In_opt_ HWND hWnd, _In_opt_ LPCWSTR lpText, _In_opt_ LPCWSTR lpCaption, _In_ UINT uType) = MessageBoxW;
static int(WINAPI* OldMessageBoxA)(_In_opt_ HWND hWnd, _In_opt_ LPCSTR lpText, _In_opt_ LPCSTR lpCaption, _In_ UINT uType) = MessageBoxA;

extern "C" __declspec(dllexport) int WINAPI NewMessageBoxA(_In_opt_ HWND hWnd, _In_opt_ LPCSTR lpText, _In_opt_ LPCSTR lpCaption, _In_ UINT uType)
{
    

    printf("\n\n**********************************\n");
    printf("MessageBoxA Hooked\n");
    GetLocalTime(&st);
    printf("DLL输出:%d-%d-%d %02d: %02d: %02d: %03d\n", st.wYear, st.wMonth, st.wDay, st.wHour, st.wMinute, st.wSecond, st.wMilliseconds);
    std::string text(lpText);
    std::string caption(lpCaption);
    std::cout << "Text:" << text << std::endl;
    std::cout << "Caption:" << caption << std::endl;

    DWORD dwProcessId = GetCurrentProcessId();
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION, FALSE, dwProcessId);
    if (hProcess != NULL) {
        WCHAR wszProcessName[2 * MAX_PATH] = { 0 };
        DWORD dwLength = sizeof(wszProcessName);
        QueryFullProcessImageNameW(hProcess, 0, wszProcessName, &dwLength);
        CloseHandle(hProcess);

        printf("The name of process: %ws\n", wszProcessName);
        DWORD dwSize = 0;
        DWORD num = GetProcessImageFileNameW(hProcess, wszProcessName, 2 * MAX_PATH);
        if (num > 0) {
            printf("The name of exe file: %ws\n", wszProcessName);
        }
    }

    printf("**************************************\n");
    return OldMessageBoxA(NULL, "new MessageBoxA", "Hooked", MB_OK);
}

extern "C" __declspec(dllexport) int WINAPI NewMessageBoxW(_In_opt_ HWND hWnd, _In_opt_ LPCWSTR lpText, _In_opt_ LPCWSTR lpCaption, _In_ UINT uType)
{
    printf("\n\n**********************************\n");
    printf("MessageBoxW Hooked\n");
    GetLocalTime(&st);
    printf("DLL输出:%d-%d-%d %02d: %02d: %02d: %03d\n", st.wYear, st.wMonth, st.wDay, st.wHour, st.wMinute, st.wSecond, st.wMilliseconds);
    printf("**************************************\n");
    return OldMessageBoxW(NULL, L"new MessageBoxW", L"Hooked", MB_OK);
}

BOOL APIENTRY DllMain(HMODULE hModule,
    DWORD ul_reason_for_call,
    LPVOID lpReserved)
{
    /*---------------------------------------------------------------------------------------*/
    // 创建一个JSON对象
    json response_json;
    response_json["name"] = "test1";
    response_json["id"] = "U202112003";
    response_json["priority"] = "high";
    response_json["EXE"] = { { "size", "1024" }, { "drive", "C:" } };
    response_json["thread"] = { { "id", "1" }, { "handle", "handle1" } };
    response_json["OUTPUT"] = { { "output1", "111" }, { "output2", "222" } };

    // 将JSON对象转换为字符串
    std::string jsonString = response_json.dump();

    // 写入管道
    DWORD bytesWritten;
    WriteFile(
        hPipe, // 管道句柄
        jsonString.c_str(), // 数据缓冲区
        jsonString.size(), // 数据大小
        &bytesWritten, // 写入的字节数
        NULL); // 不使用重叠
    /*---------------------------------------------------------------------------------------*/
    switch (ul_reason_for_call) {
    case DLL_PROCESS_ATTACH:
        DisableThreadLibraryCalls(hModule);
        DetourRestoreAfterWith();
        DetourTransactionBegin();
        DetourUpdateThread(GetCurrentThread());
        DetourAttach(&(PVOID&)OldMessageBoxW, NewMessageBoxW);
        DetourAttach(&(PVOID&)OldMessageBoxA, NewMessageBoxA);
        DetourTransactionCommit();
        break;
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
    case DLL_PROCESS_DETACH:
        DetourTransactionBegin();
        DetourUpdateThread(GetCurrentThread());
        DetourDetach(&(PVOID&)OldMessageBoxW, NewMessageBoxW);
        DetourDetach(&(PVOID&)OldMessageBoxA, NewMessageBoxA);
        DetourTransactionCommit();
        break;
    }
    return TRUE;
}