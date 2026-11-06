public class LoginService {

    public boolean autenticar(String usuario, String password) {
            // Validación básica para simular el inicio de sesión
            if (usuario == null || password == null) {
                return false;
            }

            // Simulación: Credenciales válidas
            return usuario.equals("camila@test.com") && password.equals("Password123!");
    }
}
