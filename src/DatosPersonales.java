// DatosPersonales.java
// Programa de consola que solicita nombre y edad, y los muestra.
// Requisitos: usar Scanner(System.in) y System.out.println

import java.util.Scanner; // Importa Scanner para leer desde teclado

public class DatosPersonales { // Define la clase pública DatosPersonales
    public static void main(String[] args) { // Método principal (entrada del programa)
        Scanner sc = new Scanner(System.in);  // Crea el lector de consola

        System.out.print("Ingrese su nombre: "); // Pide nombre
        String nombre = sc.nextLine();           // Lee nombre como texto

        System.out.print("Ingrese su edad: ");   // Pide edad
        int edad = sc.nextInt();                 // Lee edad como entero

        System.out.println("Nombre: " + nombre + " | Edad: " + edad); // Muestra resultado

        sc.close(); // Cierra el scanner
    } // Fin de main
} // Fin de clase DatosPersonales
