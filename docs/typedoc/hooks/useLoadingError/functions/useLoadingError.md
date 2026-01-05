[**proyecto-e09 v1.0.0**](../../../README.md)

***

[proyecto-e09](../../../modules.md) / [hooks/useLoadingError](../README.md) / useLoadingError

# Function: useLoadingError()

> **useLoadingError**(`initialLoading`): `UseLoadingErrorReturn`

Defined in: [src/client/hooks/useLoadingError.ts:47](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/hooks/useLoadingError.ts#L47)

Hook personalizado para manejar estados de loading y error

## Parameters

### initialLoading

`boolean` = `false`

Estado inicial de carga (default: false)

## Returns

`UseLoadingErrorReturn`

Objeto con estados y funciones

## Example

```ts
const { loading, error, startLoading, stopLoading, handleError } = useLoadingError();

async function fetchData() {
  startLoading();
  try {
    const data = await api.getData();
    return data;
  } catch (err) {
    handleError(err);
  } finally {
    stopLoading();
  }
}
```
