import subprocess

if __name__ == "__main__":
    servers = [
        ("127.0.0.1", 8001),
        ("127.0.0.1", 8002),
        ("127.0.0.1", 8003),
        ("127.0.0.1", 8004),
    ]

    processes = []
    for host, port in servers:
        cmd = ["uvicorn", "api:ApiWebSocket", "--host", host, "--port", str(port)]
        processes.append(subprocess.Popen(cmd))

    try:
        # Wait for all servers to finish
        for proc in processes:
            proc.wait()
    except KeyboardInterrupt:
        # Gracefully terminate the servers
        for proc in processes:
            proc.terminate()
