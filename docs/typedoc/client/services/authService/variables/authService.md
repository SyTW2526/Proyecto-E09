[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [client/services/authService](../README.md) / authService

# Variable: authService

> `const` **authService**: `object`

Defined in: [src/client/services/authService.ts:33](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/services/authService.ts#L33)

## Type Declaration

### deleteAccount()

> **deleteAccount**(`username`): `Promise`\<`void`\>

Elimina la cuenta del usuario

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`void`\>

### deleteProfileImage()

> **deleteProfileImage**(`username`): `Promise`\<`User`\>

Elimina la imagen de perfil del usuario

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`User`\>

### getAuthHeaders()

> **getAuthHeaders**(): \{ \} \| \{ `Authorization`: `string`; \}

Retorna headers con el token para peticiones autenticadas

#### Returns

\{ \} \| \{ `Authorization`: `string`; \}

### getToken()

> **getToken**(): `string` \| `null`

Obtiene el token JWT del localStorage

#### Returns

`string` \| `null`

### getUser()

> **getUser**(): `User` \| `null`

Obtiene el usuario del localStorage

#### Returns

`User` \| `null`

### isAuthenticated()

> **isAuthenticated**(): `boolean`

Verifica si el usuario está autenticado

#### Returns

`boolean`

### login()

> **login**(`data`): `Promise`\<`AuthResponse`\>

Inicia sesión con un usuario existente

#### Parameters

##### data

`LoginData`

#### Returns

`Promise`\<`AuthResponse`\>

### logout()

> **logout**(): `void`

Cierra la sesión del usuario

#### Returns

`void`

### register()

> **register**(`data`): `Promise`\<`AuthResponse`\>

Registra un nuevo usuario

#### Parameters

##### data

`RegisterData`

#### Returns

`Promise`\<`AuthResponse`\>

### saveToken()

> **saveToken**(`token`): `void`

Guarda el token JWT en localStorage

#### Parameters

##### token

`string`

#### Returns

`void`

### saveUser()

> **saveUser**(`user`): `void`

Guarda el usuario en localStorage

#### Parameters

##### user

`User`

#### Returns

`void`

### updateProfile()

> **updateProfile**(`currentUsername`, `changes`): `Promise`\<`User`\>

Actualiza el perfil del usuario

#### Parameters

##### currentUsername

`string`

##### changes

###### email?

`string`

###### username?

`string`

#### Returns

`Promise`\<`User`\>

### updateProfileImage()

> **updateProfileImage**(`username`, `profileImage`): `Promise`\<`User`\>

Actualiza la imagen de perfil del usuario

#### Parameters

##### username

`string`

##### profileImage

`string`

#### Returns

`Promise`\<`User`\>
