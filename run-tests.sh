#!/bin/bash

echo "Compilando proyecto..."
npm run build

echo ""
echo "═══════════════════════════════════════"
echo "  TESTS DE MODELOS (BASE DE DATOS)"
echo "═══════════════════════════════════════"

echo ""
echo "Ejecutando tests de User..."
node dist/test/models/user.spec.js
if [ $? -ne 0 ]; then
    echo "Tests de User fallaron"
    exit 1
fi

echo ""
echo "Ejecutando tests de Card..."
node dist/test/models/card.spec.js
if [ $? -ne 0 ]; then
    echo "Tests de Card fallaron"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════"
echo "  TESTS DE INTEGRACIÓN (API)"
echo "═══════════════════════════════════════"

echo ""
echo "Ejecutando tests de API de usuarios..."
node dist/test/integration/users.spec.js
if [ $? -ne 0 ]; then
    echo "Tests de API fallaron"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════"
echo "  TODOS LOS TESTS PASARON"
echo "═══════════════════════════════════════"
