import { describe, it, expect } from "vitest";
import { generateAuthToken } from "../../src/server/utils/jwtHelpers.js";
import jwt from "jsonwebtoken";

describe("jwtHelpers - Unit Tests", () => {
  describe("generateAuthToken", () => {
    it("debería exportar función generateAuthToken", () => {
      expect(typeof generateAuthToken).toBe("function");
    });

    it("debería generar un token JWT válido", () => {
      const userId = "507f1f77bcf86cd799439011";
      const username = "testuser";

      const token = generateAuthToken(userId, username);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      // JWT has 3 parts separated by dots
      expect(token.split(".").length).toBe(3);
    });

    it("debería contener el userId en el payload", () => {
      const userId = "507f1f77bcf86cd799439011";
      const username = "testuser";

      const token = generateAuthToken(userId, username);
      const secret = process.env.JWT_SECRET || "tu-clave-secreta";
      const decoded = jwt.verify(token, secret) as any;

      expect(decoded.userId).toBe(userId);
    });

    it("debería contener el username en el payload", () => {
      const userId = "507f1f77bcf86cd799439011";
      const username = "testuser";

      const token = generateAuthToken(userId, username);
      const secret = process.env.JWT_SECRET || "tu-clave-secreta";
      const decoded = jwt.verify(token, secret) as any;

      expect(decoded.username).toBe(username);
    });

    it("debería generar tokens diferentes para usuarios diferentes", () => {
      const token1 = generateAuthToken("user1", "username1");
      const token2 = generateAuthToken("user2", "username2");

      expect(token1).not.toBe(token2);
    });

    it("debería verificar correctamente con la clave secreta", () => {
      const userId = "507f1f77bcf86cd799439011";
      const username = "testuser";

      const token = generateAuthToken(userId, username);
      const secret = process.env.JWT_SECRET || "tu-clave-secreta";

      // Should not throw
      expect(() => jwt.verify(token, secret)).not.toThrow();
    });

    it("debería fallar con clave secreta incorrecta", () => {
      const token = generateAuthToken("user1", "username1");
      const wrongSecret = "wrong-secret";

      expect(() => jwt.verify(token, wrongSecret)).toThrow();
    });

    it("debería tener tiempo de expiración", () => {
      const token = generateAuthToken("user1", "username1");
      const decoded = jwt.decode(token, { complete: true }) as any;

      expect(decoded.payload.exp).toBeDefined();
      // exp should be in the future
      expect(decoded.payload.exp * 1000).toBeGreaterThan(Date.now());
    });

    it("debería aceptar expiración personalizada", () => {
      const token = generateAuthToken("user1", "username1", "24h");
      const secret = process.env.JWT_SECRET || "tu-clave-secreta";

      // Should verify without errors
      expect(() => jwt.verify(token, secret)).not.toThrow();
    });

    it("debería manejar ObjectIds como strings", () => {
      const userId = "507f1f77bcf86cd799439011";
      const username = "user";

      const token = generateAuthToken(userId, username);
      const secret = process.env.JWT_SECRET || "tu-clave-secreta";
      const decoded = jwt.verify(token, secret) as any;

      expect(decoded.userId).toBe(userId);
    });

    it("debería generar tokens válidos con datos iguales", () => {
      const token1 = generateAuthToken("user1", "username1");
      const token2 = generateAuthToken("user1", "username1");

      // Both tokens should be valid and have the same user data
      const secret = process.env.JWT_SECRET || "tu-clave-secreta";
      const decoded1 = jwt.verify(token1, secret) as any;
      const decoded2 = jwt.verify(token2, secret) as any;

      expect(decoded1.userId).toBe(decoded2.userId);
      expect(decoded1.username).toBe(decoded2.username);
    });
  });
});

