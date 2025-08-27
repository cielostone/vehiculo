// UsuarioVehiculo.java
// Programa inicial (principal) para la entrega de Semana 3.
// Solicita nombre y edad del usuario + datos del vehículo y muestra un resumen.

import java.util.Scanner;

public class UsuarioVehiculo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // --- Datos del usuario ---
        System.out.print("Ingrese su nombre: ");
        String nombre = sc.nextLine();

        System.out.print("Ingrese su edad: ");
        int edad = sc.nextInt();
        sc.nextLine(); // limpiar buffer

        // --- Datos del vehículo ---
        System.out.print("Ingrese la marca del vehículo: ");
        String marca = sc.nextLine();

        System.out.print("Ingrese el modelo del vehículo: ");
        String modelo = sc.nextLine();

        System.out.print("Ingrese la cilindrada (ej: 1.5): ");
        double cilindrada = sc.nextDouble();
        sc.nextLine(); // limpiar buffer

        System.out.print("Ingrese el tipo de combustible: ");
        String combustible = sc.nextLine();

        System.out.print("Ingrese la capacidad de pasajeros: ");
        int pasajeros = sc.nextInt();

        // --- Resumen ---
        System.out.println("\n===== RESUMEN DE DATOS =====");
        System.out.println("Usuario: " + nombre + ", Edad: " + edad + " años");
        System.out.println("Vehículo: " + marca + " " + modelo);
        System.out.println("Cilindrada: " + cilindrada);
        System.out.println("Combustible: " + combustible);
        System.out.println("Capacidad: " + pasajeros + " pasajeros");

        sc.close();
    }
}
