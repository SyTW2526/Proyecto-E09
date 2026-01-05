[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/middleware/authMiddleware](../README.md) / authMiddleware

# Function: authMiddleware()

> **authMiddleware**(`req`, `res`, `next`): `void`

Defined in: [src/server/middleware/authMiddleware.ts:20](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/middleware/authMiddleware.ts#L20)

Middleware de autenticación con JWT
Valida el token enviado en el header Authorization

Uso:
router.get('/protected-route', authMiddleware, (req, res) => { ... })

## Parameters

### req

[`AuthRequest`](../interfaces/AuthRequest.md)

### res

`Response`

### next

`NextFunction`

## Returns

`void`
