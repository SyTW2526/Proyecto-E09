[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/middleware/authMiddleware](../README.md) / optionalAuthMiddleware

# Function: optionalAuthMiddleware()

> **optionalAuthMiddleware**(`req`, `_res`, `next`): `void`

Defined in: [src/server/middleware/authMiddleware.ts:75](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/middleware/authMiddleware.ts#L75)

Middleware opcional de autenticación.
Si viene un token válido en Authorization lo decodifica y pone req.userId/username.
Si no viene token o es inválido, no bloquea la petición — simplemente continúa sin user info.

## Parameters

### req

[`AuthRequest`](../interfaces/AuthRequest.md)

### \_res

`Response`

### next

`NextFunction`

## Returns

`void`
