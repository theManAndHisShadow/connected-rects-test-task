export default class PriorityHeap<T> {
    private heap: { item: T, priority: number }[] = [];

    enqueue(item: T, priority: number): void {
        this.heap.push({ item, priority });
        this.bubbleUp();
    }

    dequeue(): T | undefined {
        if (this.isEmpty()) return undefined;

        const min = this.heap[0].item;
        const last = this.heap.pop();
        if (this.heap.length > 0 && last) {
            this.heap[0] = last;
            this.bubbleDown();
        }

        return min;
    }

    private bubbleUp(): void {
        let index = this.heap.length - 1;
        const element = this.heap[index];

        while (index > 0) {
            const parentIndex = (index - 1) >>> 1;
            const parent = this.heap[parentIndex];

            if (element.priority >= parent.priority) break;

            this.heap[index] = parent;
            this.heap[parentIndex] = element;
            index = parentIndex;
        }
    }

    private bubbleDown(): void {
        let index = 0;
        const length = this.heap.length;
        const element = this.heap[0];

        while (true) {
            const leftChildIndex = (2 * index) + 1;
            const rightChildIndex = (2 * index) + 2;
            let swapIndex = -1;

            if (leftChildIndex < length) {
                const leftChild = this.heap[leftChildIndex];
                if (leftChild.priority < element.priority) {
                    swapIndex = leftChildIndex;
                }
            }

            if (rightChildIndex < length) {
                const rightChild = this.heap[rightChildIndex];
                if (rightChild.priority < (swapIndex === -1 ? element.priority : this.heap[swapIndex].priority)) {
                    swapIndex = rightChildIndex;
                }
            }

            if (swapIndex === -1) break;

            this.heap[index] = this.heap[swapIndex];
            this.heap[swapIndex] = element;
            index = swapIndex;
        }
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }
}
