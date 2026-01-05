[**proyecto-e09 v1.0.0**](../../../README.md)

***

[proyecto-e09](../../../modules.md) / [hooks/useLanguage](../README.md) / useLanguage

# Function: useLanguage()

> **useLanguage**(): `"es"` \| `"en"`

Defined in: [src/client/hooks/useLanguage.ts:34](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/hooks/useLanguage.ts#L34)

Hook para gestionar el idioma de la aplicación

Efectos:
- Lee el idioma del estado Redux
- Actualiza el atributo lang en el HTML root
- Se sincroniza automáticamente cuando cambia el idioma

## Returns

`"es"` \| `"en"`

Idioma actual ('es' | 'en')

## Example

```ts
function MyComponent() {
  const language = useLanguage();
  return <div>Idioma actual: {language}</div>;
}
```
