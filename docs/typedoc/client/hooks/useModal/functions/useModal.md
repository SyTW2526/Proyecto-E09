[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [client/hooks/useModal](../README.md) / useModal

# Function: useModal()

> **useModal**(`initialState`): `object`

Defined in: [src/client/hooks/useModal.ts:25](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/hooks/useModal.ts#L25)

Custom hook for managing modal visibility state.
Provides a simple interface for showing/hiding modals.

## Parameters

### initialState

`boolean` = `false`

Initial visibility state (default: false)

## Returns

Object with isOpen state and open/close/toggle functions

### close()

> **close**: () => `void`

Closes the modal

#### Returns

`void`

### isOpen

> **isOpen**: `boolean`

### open()

> **open**: () => `void`

Opens the modal

#### Returns

`void`

### toggle()

> **toggle**: () => `void`

Toggles the modal state

#### Returns

`void`

## Example

```tsx
const loginModal = useModal();
const confirmModal = useModal(false);

return (
  <>
    <button onClick={loginModal.open}>Open Login</button>
    <Modal visible={loginModal.isOpen} onClose={loginModal.close}>
      <LoginForm />
    </Modal>
  </>
);
```
