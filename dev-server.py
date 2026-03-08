import subprocess
import os
import signal
import sys
import time

def run_dev():
    print("--- Starting Dev Environment ---")
    
    # Ensure current directory is correct
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)

    # Use 'shell=True' for Windows compatibility to find .cmd files
    # Use 'python' for python script
    
    # 1. Watcher (Nodemon)
    watcher_cmd = 'npx nodemon --watch content -e md --exec "python build.py"'
    
    # 2. Server (BrowserSync)
    server_cmd = 'npx browser-sync start --server --files "**/*.{html,css,js}" --no-notify'

    processes = []
    try:
        # Start watcher
        p_watch = subprocess.Popen(watcher_cmd, shell=True)
        processes.append(p_watch)
        print("Started watcher (nodemon)")
        
        # Start server
        p_serve = subprocess.Popen(server_cmd, shell=True)
        processes.append(p_serve)
        print("Started server (browser-sync)")

        # Wait for processes
        while True:
            time.sleep(1)
            # Check if either died
            if p_watch.poll() is not None:
                print("Watcher stopped.")
                break
            if p_serve.poll() is not None:
                print("Server stopped.")
                break
                
    except KeyboardInterrupt:
        print("\nStopping dev server...")
    finally:
        for p in processes:
            p.terminate()
            try:
                p.wait(timeout=2)
            except:
                p.kill()

if __name__ == "__main__":
    run_dev()
