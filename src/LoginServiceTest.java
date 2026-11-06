import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class LoginServiceTest {

    @Test
    void loginExitosoDeberiaRetornarTrue() {
        var auth = new LoginService();
        boolean resultado = auth.autenticar("camila@test.com", "Password123!");
        assertTrue(resultado, "El login con credenciales correctas debe retornar true");
    }

    @Test
    void passwordIncorrectoDeberiaRetornarFalse() {
        var auth = new LoginService();
        boolean resultado = auth.autenticar("camila@test.com", "PasswordErrado");
        assertFalse(resultado, "El login con password incorrecto debe retornar false");
    }

    @Test
    void usuarioNuloDeberiaRetornarFalse() {
        var auth = new LoginService();
        boolean resultado = auth.autenticar(null, "Password123!");
        assertFalse(resultado, "El login con usuario nulo debe manejar el edge case y retornar false");
    }
}
