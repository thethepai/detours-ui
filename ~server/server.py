import asyncio
import websockets
import json
import os
import sys
import subprocess
import win32file
import win32pipe
import pywintypes

class WebSocketServer:
    def __init__(self):
        self.websocket = None
        self.is_open = False

    async def handler(self, websocket, path):
        self.websocket = websocket
        self.is_open = True
        await websocket.wait_closed()
        self.is_open = False

    async def send_message(self, message):
        if self.websocket is not None and self.is_open:
            await self.websocket.send(json.dumps(message))
    
    async def close_connection(self):
        if self.websocket is not None:
            await self.websocket.close()
            self.websocket = None

ws_server = WebSocketServer()

def pipe_server():
    pipe_name = r'\\.\pipe\mypipe'
    server = None
    num = 0
    messages = []
    while True:
        server = websockets.serve(ws_server.handler, 'localhost', 8112)
        asyncio.get_event_loop().run_until_complete(server)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        p = subprocess.Popen(['./inject.exe'])
        
        if getattr(sys, 'frozen', False):
            print(os.path.dirname(sys.executable))
            script_dir_new = os.path.dirname(sys.executable)
            log_file_path = os.path.join(script_dir_new, 'log.txt')
        else:
            log_file_path = os.path.join(script_dir, 'log.txt')
        
        pipe_handle = win32pipe.CreateNamedPipe(
            pipe_name,
            win32pipe.PIPE_ACCESS_DUPLEX,
            win32pipe.PIPE_TYPE_MESSAGE | win32pipe.PIPE_READMODE_MESSAGE | win32pipe.PIPE_WAIT,
            1, 65536, 65536,
            0,
            None
        )

        print("wait for connection...")
        win32pipe.ConnectNamedPipe(pipe_handle, None)

        try:
            while True:
                # 读取
                result, data = win32file.ReadFile(pipe_handle, 64*1024)
                message = data.decode('utf-8')
                print(f"!!recieved: {message}")
                messages.append(message)

                # 应答
                print(num)
                asyncio.get_event_loop().run_until_complete(ws_server.send_message(num))
                asyncio.get_event_loop().run_until_complete(ws_server.send_message(num))
                num += 1
                asyncio.get_event_loop().run_until_complete(ws_server.send_message(message))
                
                # 暂时没用
                if message == "unlink":
                    print("dll unlink success!")
                    break
        except pywintypes.error as e:
            if e.args[0] == 109:  # ERROR_BROKEN_PIPE, client disconnected
                print("client disconnected!")
            else:
                print(f"an error(s) occured: {e}")
        finally:
            num = 0
            win32file.CloseHandle(pipe_handle)
            p.terminate()
            # close websocket
            asyncio.get_event_loop().run_until_complete(ws_server.close_connection())
            # close server
            if server:
                server.ws_server.close()
                asyncio.get_event_loop().run_until_complete(server.ws_server.wait_closed())
                # server.close()
                # asyncio.get_event_loop().run_until_complete(server.wait_closed())
                
            print("generating log...")    
            # 将信息写入log.txt
            # try:
            #     with open(log_file_path, 'a') as f:
            #         f.write('\n'.join(messages))
            # except Exception as e:
            #     print(f"Error writing to log file: {e}")
            messages = []
            print("preparring for next connection...")

if __name__ == '__main__':
    pipe_server()