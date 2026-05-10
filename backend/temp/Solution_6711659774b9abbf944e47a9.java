import java.util.Scanner;

public class Solution_6711659774b9abbf944e47a9 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        int count = 0;
        for (char c : s.toCharArray()) {
            if ("aeiouAEIOU".indexOf(c) != -1) count++;
        }
        System.out.println(count);
    }
}
