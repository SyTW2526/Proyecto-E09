import { describe, it, beforeEach, expect, afterEach } from "vitest";
import { User } from "../../src/server/models/User.js";
import {
  findUserByUsernameOrEmail,
  validateUsernameEmail,
  validateUsernameOwnership,
  validateRegistrationInput,
} from "../../src/server/utils/validationHelpers.js";

const testUser1 = {
  username: "testvalidation1",
  email: "testvalidation1@example.com",
  password: "password123",
};

const testUser2 = {
  username: "testvalidation2",
  email: "testvalidation2@example.com",
  password: "password123",
};

beforeEach(async () => {
  await User.deleteMany();
});

afterEach(async () => {
  await User.deleteMany();
});

describe("validationHelpers", () => {
  describe("findUserByUsernameOrEmail", () => {
    beforeEach(async () => {
      await User.create(testUser1);
      await User.create(testUser2);
    });

    it("encuentra usuario por username", async () => {
      const user = await findUserByUsernameOrEmail("testvalidation1");

      expect(user).not.toBeNull();
      expect(user?.username).toBe("testvalidation1");
      expect(user?.email).toBe("testvalidation1@example.com");
    });

    it("encuentra usuario por email", async () => {
      const user = await findUserByUsernameOrEmail("testvalidation1@example.com");

      expect(user).not.toBeNull();
      expect(user?.username).toBe("testvalidation1");
      expect(user?.email).toBe("testvalidation1@example.com");
    });

    it("devuelve null para usuario inexistente", async () => {
      const user = await findUserByUsernameOrEmail("usuarionoexiste");

      expect(user).toBeNull();
    });

    it("es case-sensitive para username", async () => {
      const user = await findUserByUsernameOrEmail("TESTVALIDATION1");

      // MongoDB queries are case-sensitive by default unless specified otherwise
      expect(user).toBeNull();
    });

    it("maneja email no encontrado", async () => {
      const user = await findUserByUsernameOrEmail("noexit@example.com");

      expect(user).toBeNull();
    });

    it("devuelve el primer usuario cuando hay múltiples coincidencias", async () => {
      const user = await findUserByUsernameOrEmail("testvalidation1");

      expect(user?.username).toBe("testvalidation1");
    });
  });

  describe("validateUsernameEmail", () => {
    beforeEach(async () => {
      await User.create(testUser1);
    });

    it("valida username y email nuevos válidos", async () => {
      const result = await validateUsernameEmail(
        "newusername",
        "newemail@example.com",
        "oldusername",
        "oldemail@example.com"
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("rechaza username que ya existe", async () => {
      const result = await validateUsernameEmail(
        "testvalidation1", // Try to use existing username
        "newemail@example.com",
        "otheruser", // Current username is different
        "oldemail@example.com"
      );

      expect(result.valid).toBe(false);
      expect(result.field).toBe("username");
      expect(result.error).toBe("USERNAME_EXISTS");
    });

    it("rechaza email que ya existe", async () => {
      const result = await validateUsernameEmail(
        "newusername",
        "testvalidation1@example.com",
        "oldusername",
        "oldemail@example.com"
      );

      expect(result.valid).toBe(false);
      expect(result.field).toBe("email");
      expect(result.error).toBe("EMAIL_EXISTS");
    });

    it("permite username si es el mismo que el actual", async () => {
      const result = await validateUsernameEmail(
        "testvalidation1",
        "newemail@example.com",
        "testvalidation1",
        "oldemail@example.com"
      );

      // Should fail on email check, not username
      expect(result.field).not.toBe("username");
    });

    it("permite email si es el mismo que el actual", async () => {
      const result = await validateUsernameEmail(
        "newusername",
        "testvalidation1@example.com",
        "oldusername",
        "testvalidation1@example.com"
      );

      // Should pass because email is same as current
      expect(result.valid).toBe(true);
    });

    it("valida cuando username y email no se proporcionan (undefined)", async () => {
      const result = await validateUsernameEmail(
        undefined,
        undefined,
        "currentusername",
        "currentemail@example.com"
      );

      expect(result.valid).toBe(true);
    });

    it("valida cuando solo se proporciona username nuevo", async () => {
      const result = await validateUsernameEmail(
        "newusername",
        undefined,
        "currentusername",
        "currentemail@example.com"
      );

      expect(result.valid).toBe(true);
    });

    it("valida cuando solo se proporciona email nuevo", async () => {
      const result = await validateUsernameEmail(
        undefined,
        "newemail@example.com",
        "currentusername",
        "currentemail@example.com"
      );

      expect(result.valid).toBe(true);
    });

    it("rechaza ambos si existen", async () => {
      await User.create({
        username: "existingusername",
        email: "existingemail@example.com",
        password: "pass",
      });

      const result = await validateUsernameEmail(
        "existingusername",
        "existingemail@example.com",
        "currentusername",
        "currentemail@example.com"
      );

      expect(result.valid).toBe(false);
      expect(result.field).toBe("username"); // First check fails
    });
  });

  describe("validateUsernameOwnership", () => {
    it("valida que el usuario es propietario", () => {
      const result = validateUsernameOwnership("johndoe", "johndoe");

      expect(result).toBe(true);
    });

    it("rechaza si el usuario no es propietario", () => {
      const result = validateUsernameOwnership("johndoe", "janedoe");

      expect(result).toBe(false);
    });

    it("valida múltiples pares de usernames", () => {
      const pairs = [
        { req: "user1", param: "user1", expected: true },
        { req: "user1", param: "user2", expected: false },
        { req: "admin", param: "admin", expected: true },
        { req: "test_user", param: "test_user", expected: true },
      ];

      pairs.forEach((pair) => {
        const result = validateUsernameOwnership(pair.req, pair.param);
        expect(result).toBe(pair.expected);
      });
    });

    it("es case-sensitive", () => {
      const result = validateUsernameOwnership("JohnDoe", "johndoe");

      expect(result).toBe(false);
    });

    it("maneja usernames con espacios", () => {
      const result = validateUsernameOwnership("john doe", "john doe");

      expect(result).toBe(true);
    });

    it("maneja usernames vacíos", () => {
      const result = validateUsernameOwnership("", "");

      expect(result).toBe(true);
    });
  });

  describe("validateRegistrationInput", () => {
    it("valida entrada completa y correcta", () => {
      const result = validateRegistrationInput(
        "newuser",
        "newuser@example.com",
        "password123",
        "password123"
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("rechaza cuando falta username", () => {
      const result = validateRegistrationInput(
        undefined,
        "newuser@example.com",
        "password123",
        "password123"
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Todos los campos son requeridos");
    });

    it("rechaza cuando falta email", () => {
      const result = validateRegistrationInput(
        "newuser",
        undefined,
        "password123",
        "password123"
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Todos los campos son requeridos");
    });

    it("rechaza cuando falta password", () => {
      const result = validateRegistrationInput(
        "newuser",
        "newuser@example.com",
        undefined,
        "password123"
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Todos los campos son requeridos");
    });

    it("rechaza cuando falta confirmPassword", () => {
      const result = validateRegistrationInput(
        "newuser",
        "newuser@example.com",
        "password123",
        undefined
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Todos los campos son requeridos");
    });

    it("rechaza cuando las contraseñas no coinciden", () => {
      const result = validateRegistrationInput(
        "newuser",
        "newuser@example.com",
        "password123",
        "password456"
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Las contraseñas no coinciden");
    });

    it("valida contraseñas que coinciden exactamente", () => {
      const result = validateRegistrationInput(
        "newuser",
        "newuser@example.com",
        "MyP@ssw0rd!",
        "MyP@ssw0rd!"
      );

      expect(result.valid).toBe(true);
    });

    it("rechaza campos vacíos", () => {
      const result = validateRegistrationInput("", "", "", "");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Todos los campos son requeridos");
    });

    it("rechaza cuando solo falta un campo", () => {
      const result = validateRegistrationInput(
        "newuser",
        "newuser@example.com",
        "password123",
        undefined
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Todos los campos son requeridos");
    });

    it("rechaza todos undefined", () => {
      const result = validateRegistrationInput(undefined, undefined, undefined, undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Todos los campos son requeridos");
    });

    it("es case-sensitive en contraseñas", () => {
      const result = validateRegistrationInput(
        "newuser",
        "newuser@example.com",
        "Password123",
        "password123"
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Las contraseñas no coinciden");
    });
  });
});
