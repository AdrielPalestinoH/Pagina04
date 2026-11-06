
public class LoginService {

    public boolean autenticar(String usuario, String password) {
        // Corrección para el Issue #2: Validar nulos explícitamente
        if (usuario == null || password == null) {
            return false;
        }

        return usuario.equals("camila@test.com") && password.equals("Password123!");
    }
}
