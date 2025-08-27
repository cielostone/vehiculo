// SesionUsuarioVehiculo.java
// Programa principal (oficial) – Semana 3 AIEP
// Simula una sesión de usuario (nombre + edad), luego solicita datos del vehículo
// y muestra un resumen final. Hecho para compilar y ejecutar SIN IDE.

import java.util.Scanner;

public class SesionUsuarioVehiculo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // ---- INICIO DE SESIÓN ----
        System.out.println("===== INICIO DE SESIÓN =====");
        System.out.print("Ingrese su nombre de usuario: ");
        String nombre = sc.nextLine();

        System.out.print("Ingrese su edad: ");
        int edad = sc.nextInt();
        sc.nextLine(); // limpiar buffer

        System.out.println("\n¡Bienvenido/a " + nombre + "! Sesión iniciada correctamente.\n");

        // ---- DATOS DEL VEHÍCULO ----
        System.out.println("===== INGRESO DE DATOS DEL VEHÍCULO =====");
        System.out.print("Ingrese la marca: ");
        String marca = sc.nextLine();

        System.out.print("Ingrese el modelo: ");
        String modelo = sc.nextLine();

        System.out.print("Ingrese la cilindrada (ej: 1.5): ");
        double cilindrada = sc.nextDouble();
        sc.nextLine(); // limpiar buffer

        System.out.print("Ingrese el tipo de combustible: ");
        String combustible = sc.nextLine();

        System.out.print("Ingrese la capacidad de pasajeros: ");
        int pasajeros = sc.nextInt();

        // ---- SALIDA FINAL ----
        System.out.println("\n===== DATOS DE SALIDA =====");
        System.out.println("Usuario: " + nombre + " | Edad: " + edad + " años");
        System.out.println("La marca que ha ingresado es: " + marca);
        System.out.println("El modelo que ha ingresado es: " + modelo);
        System.out.println("La cilindrada que ha ingresado es: " + cilindrada);
        System.out.println("El tipo de combustible es: " + combustible);
        System.out.println("Tiene una capacidad de " + pasajeros + " pasajeros.");
        System.out.println("\nSesión finalizada. ¡Gracias por usar el sistema, " + nombre + "!");

        sc.close();
    }
}
