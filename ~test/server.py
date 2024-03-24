import win32pipe
import win32file
import pywintypes
import subprocess
import time
import os
import json

def pipe_server():
    pipe_name = r'\\.\pipe\mypipe'
    while True:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        p = subprocess.Popen(['./inject.exe'])
        # subprocess.Popen(['./inject.exe'], creationflags=subprocess.CREATE_NO_WINDOW)
        time.sleep(3)
        
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

                # 应答
                

                if message == "unlink":
                    print("dll unlink success!")
                    break
        except pywintypes.error as e:
            if e.args[0] == 109:  # ERROR_BROKEN_PIPE, client disconnected
                print("client disconnected!")
            else:
                print(f"an error(s) occured: {e}")
        finally:
            win32file.CloseHandle(pipe_handle)
            p.terminate()
            print("wait for new connection...")

if __name__ == '__main__':
    pipe_server()