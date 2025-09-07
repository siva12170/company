import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Read the full line as input
        String line = sc.nextLine();
        
        // Split input into string array
        String[] parts = line.trim().split("\\s+");
        
        // Convert to int array
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            arr[i] = Integer.parseInt(parts[i]);
        }
        
        // Sort the array
        Arrays.sort(arr);
        
        // Print result
        for (int i = 0; i < arr.length; i++) {
            System.out.print(arr[i]);
            if (i != arr.length - 1) System.out.print(" ");
        }
    }
}
