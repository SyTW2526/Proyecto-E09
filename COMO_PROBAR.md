
# Como Probar la API

## Endpoints Disponibles

### Obtener un Pokemon
```bash
curl http://localhost:3000/pokemon/pikachu
curl http://localhost:3000/pokemon/25
```

### Pokemon aleatorio
```bash
curl http://localhost:3000/pokemon/random
```

### Lista de Pokemon
```bash
curl "http://localhost:3000/pokemon/list?limit=5"
```

### Multiples Pokemon
```bash
curl -X POST http://localhost:3000/pokemon/multiple \
  -H "Content-Type: application/json" \
  -d '{"ids": [1, 4, 7, 25]}'
```

## Servidor

```bash
npm run dev
```

