public class Main {
    public static void main(String[] args) {
        Ll ob = new Ll();
        ob.insert(4);
        ob.insert(5);
        ob.insert(6);
        ob.insert(7);
        ob.insert(8);
        ob.printout();
        System.out.println("Hello, World!");
    }
}

class Ll {
    private Node head;
    private Node tail;
    private int size;

    public Ll() {   // constructor should be public
        this.size = 0;
        this.head = null;
        this.tail = null;
    }

    public void insert(int k) {
        Node newnode = new Node(k);
        newnode.next = head;   // new node points to old head
        head = newnode;        // new node becomes head
        if (tail == null) {    // if list was empty, tail = head
            tail = head;
        }
        size++;
    }

    public void printout() {
        Node temp = head;
        while (temp != null) {
            System.out.print(temp.val + " -> ");
            temp = temp.next;
        }
        System.out.println("null");
    }

    private class Node {
        private int val;
        private Node next;

        private Node(int val) {
            this.val = val;
            this.next = null;
        }
    }
}
