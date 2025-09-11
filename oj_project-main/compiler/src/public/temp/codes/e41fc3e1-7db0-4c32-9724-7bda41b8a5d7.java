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

public class  Ll{
    private node head;
    private node tail;
    private int size;
    private Ll(){
        this.size = 0;
    }

    public void insert(int k){
        Node newnode = new Node(k);
        newnode.next = head;
        head = newnode;
        if(head == tail){
            tail = head;
        }
        size = size+1;
    }
    public void printout(){
        Node temp = head;
        while(temp != null){
            System.out.print(temp.val + "->");
            temp = temp.next;
        }
    }
    private class Node{
        private int val;
        private int next;
        private Node (int val){
            this.val = val;
        }
        private Node(int val,int next){
            this.val = val;
            this.next = next;
        }

    }
}
