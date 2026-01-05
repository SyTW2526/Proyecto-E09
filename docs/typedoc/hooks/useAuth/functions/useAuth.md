[**proyecto-e09 v1.0.0**](../../../README.md)

***

[proyecto-e09](../../../modules.md) / [hooks/useAuth](../README.md) / useAuth

# Function: useAuth()

> **useAuth**(): `object`

Defined in: [src/client/hooks/useAuth.ts:31](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/hooks/useAuth.ts#L31)

Hook personalizado para manejar el estado de autenticación

## Returns

`object`

Objeto con user, isAuthenticated, y funciones de auth

### isAuthenticated

> **isAuthenticated**: `boolean`

### logout()

> **logout**: () => `void`

#### Returns

`void`

### refreshUser()

> **refreshUser**: () => `void`

#### Returns

`void`

### user

> **user**: `User` \| `null`

## Example

```ts
const { user, isAuthenticated, logout } = useAuth();
if (!isAuthenticated) return <Navigate to="/login" />;
```
