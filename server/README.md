# Rodando o projeto

```bash
pip install -r requirements.txt
```

```bash
sudo apt-get install -y unicorn
```

```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

- Seu servidor estará rodando em http://localhost:8000