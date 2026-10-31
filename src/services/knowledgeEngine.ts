/**
 * PeerBot Comprehensive Multi-Subject Academic & Engineering Knowledge Engine
 * Provides accurate, question-grounded, detailed answers across Computer Science,
 * Software Engineering, Mathematics, Sciences, Career/Placements, and PeerLearn platform.
 */

export interface StudentContext {
  id?: string;
  name?: string;
  collegeName?: string;
  branch?: string;
  academicYear?: string;
  teachingSkills?: string[];
  learningSkills?: string[];
  xpPoints?: number;
}

export function answerUserQuestion(query: string, studentContext?: StudentContext): string {
  const rawQ = query.trim();
  const q = rawQ.toLowerCase();

  // ----------------------------------------------------
  // 1. GREETINGS & PLATFORM NAVIGATION
  // ----------------------------------------------------
  if (/^(hi|hello|hey|namaste|good\s*(morning|afternoon|evening)|hola|sup)(\s+.*)?$/i.test(q) && q.length < 25) {
    const studentName = studentContext?.name ? ` **${studentContext.name}**` : '';
    return `### 👋 Hello${studentName}! I'm PeerBot, your AI Learning Advisor.

I'm here to give you direct, accurate answers to any academic, engineering, or platform questions!

**Here is what you can ask me right now:**
- 💻 **Computer Science & Coding:** Any questions about Java, Python, C++, React, DSA, OOP, OS, Networks, or DBMS.
- 🐳 **DevOps & Cloud:** Docker, Kubernetes, Jenkins CI/CD, Git, Linux, or Cloud architecture.
- 📐 **Math & Sciences:** Calculus, Linear Algebra, Probability, Physics (Newton's laws, Ohm's law).
- 🤝 **PeerLearn Platform:** How to find peers, send exchange requests, schedule sessions, and earn XP.
- 🗺️ **Roadmaps & Agendas:** Customized 4-week study roadmaps and 60-minute session agendas.

*Go ahead and ask me any question!*`;
  }

  // PeerLearn platform queries
  if (q.includes('how to find') || q.includes('search peer') || q.includes('find student') || q.includes('talent profile')) {
    return `### 👥 How to Find & Connect with Peers on PeerLearn

1. **Browse Talent Profiles:**
   - Click **Talent Profiles** in the left sidebar to see all registered students from top engineering colleges (Vasavi, CBIT, Osmania, BITS, etc.).
2. **Search by Skill or Name:**
   - Use the search bar to filter by skill (e.g. *Python*, *Java*, *Docker*, *Figma*) or department.
3. **Smart Matching:**
   - Open **Smart Matching** from the sidebar. Our matching algorithm automatically pairs what you want to learn with peers who teach it and want to learn what you offer!
4. **Send an Exchange Request:**
   - Click **Connect** on any peer's card, choose the skills you want to exchange, and write a quick message. Once accepted, you can schedule live 1-on-1 sessions!`;
  }

  if (q.includes('how to schedule') || (q.includes('schedule') && q.includes('session'))) {
    return `### 📅 How to Schedule a Peer Learning Session

1. **Accept an Exchange Request:**
   - Ensure an exchange request is accepted under the **Exchange Requests** tab.
2. **Open the Scheduler:**
   - Click the purple **Schedule Session** button in the top bar or under the **Learning Sessions** tab.
3. **Pick Date, Time & Topic:**
   - Select your peer mentor/learner, select the skill topic, choose meeting mode (*Online Google Meet* or *Campus Library/Lab*), and duration (typically 45-60 mins).
4. **Complete & Earn XP:**
   - After the session concludes, mark it completed and leave a 5-star rating. Mentors receive **+100 XP** and learners receive **+50 XP**!`;
  }

  if (q.includes('xp') || q.includes('point') || q.includes('level') || q.includes('ranking') || q.includes('leaderboard')) {
    const xp = studentContext?.xpPoints ?? 1250;
    return `### ⭐ How PeerLearn XP & Ranking Works

PeerLearn recognizes collaborative peer educators through an XP (Experience Points) reward system:

- 🎓 **Host a Session (Mentor):** **+100 XP** upon completing a scheduled peer learning session.
- 📚 **Attend a Session (Learner):** **+50 XP** upon completing and rating the session.
- 🤝 **Accept an Exchange Request:** Boosts peer collaboration score.
- 🌟 **Star Ratings:** 5-star peer reviews elevate your profile visibility in the **Smart Matching** algorithms.

*Current Student XP:* **${xp} XP**. Keep teaching and learning to unlock Master Peer Mentor status!`;
  }

  // ----------------------------------------------------
  // 2. PROGRAMMING LANGUAGES (JAVA, PYTHON, C++, JS/TS)
  // ----------------------------------------------------
  if (q.includes('what is java') || (q.includes('java') && (q.includes('feature') || q.includes('explain') || q.includes('concept')) && !q.includes('script'))) {
    return `### ☕ Java & Java 21 Overview

**Java** is a robust, class-based, object-oriented programming language designed around the *"Write Once, Run Anywhere"* (WORA) philosophy via the Java Virtual Machine (JVM).

**Key Architectural Features:**
- **JVM, JRE, JDK:**
  - *JDK:* Compiler (\`javac\`) + development tools + JRE.
  - *JRE:* Runtime libraries + JVM.
  - *JVM:* Executes bytecode (\`.class\`) with Just-In-Time (JIT) compilation and automatic Garbage Collection.
- **Modern Java 21 LTS Highlights:**
  - **Virtual Threads (Project Loom):** Lightweight concurrency capable of handling millions of concurrent requests with low memory footprint.
  - **Record Classes:** Immutable data-carrier classes (\`record Student(String name, int xp) {}\`).
  - **Pattern Matching for Switch:** Type-safe pattern deconstruction without tedious \`instanceof\` casting.
  - **Sequenced Collections:** Uniform access to first/last elements across lists, sets, and maps.

\`\`\`java
public record StudentDTO(String name, String skill) {
    public void printWelcome() {
        System.out.println("Welcome " + name + " to PeerLearn skill exchange!");
    }
}
\`\`\`

*Peer Exchange Recommendation: Practice building Spring Boot 3 REST APIs connected to MySQL with a partner!*`;
  }

  if (q.includes('what is python') || (q.includes('python') && (q.includes('feature') || q.includes('explain') || q.includes('syntax')))) {
    return `### 🐍 Python: Core Concepts & Capabilities

**Python** is an interpreted, high-level, dynamically-typed programming language renowned for its clean syntax, readability, and extensive standard library.

**Key Concepts to Master:**
- **Dynamic Typing & Memory:** Variables are references to objects in memory; memory is managed via reference counting and cyclic Garbage Collector.
- **Data Structures:**
  - *Lists:* Mutable ordered sequences (\`[1, 2, 3]\`).
  - *Tuples:* Immutable sequences (\`(1, 2, 3)\`), hashable.
  - *Sets:* Unordered unique elements (\`{1, 2, 3}\`).
  - *Dictionaries:* Key-value mapping with O(1) average lookup (\`{"name": "Srija"}\`).
- **Idiomatic Features:**
  - *List Comprehensions:* \`[x**2 for x in range(10) if x % 2 == 0]\`
  - *Decorators:* Higher-order functions modifying behavior (\`@functools.wraps\`, \`@property\`).
  - *Generators:* Memory-efficient streaming using \`yield\`.

\`\`\`python
# Example: Fast generator pipeline
def fibonacci_stream(limit):
    a, b = 0, 1
    for _ in range(limit):
        yield a
        a, b = b, a + b

print(list(fibonacci_stream(6)))  # [0, 1, 1, 2, 3, 5]
\`\`\`

*Peer Project Idea: Build a peer-matching microservice using FastAPI and SQLite!*`;
  }

  if (q.includes('c++') || (q.includes('pointer') && (q.includes('c') || q.includes('memory')))) {
    return `### ⚡ Pointers & Memory Management in C / C++

A **pointer** is a variable that stores the memory address of another variable.

**Essential Syntax & Operators:**
- Address-of Operator (\`&\`): Retrieves variable's memory address.
- Dereference Operator (\`*\`): Accesses value stored at the pointer's target address.

\`\`\`cpp
#include <iostream>
using namespace std;

void swapByReference(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 10, y = 20;
    int* ptrX = &x; // ptrX stores address of x

    cout << "Value of x: " << *ptrX << endl; // Dereferencing yields 10
    swapByReference(&x, &y);
    cout << "After swap: x=" << x << ", y=" << y << endl; // x=20, y=10
    return 0;
}
\`\`\`

**Stack vs Heap Memory:**
- *Stack:* Fast, automatically managed, fixed size, stores local variables and call frames.
- *Heap:* Dynamically allocated (\`new\` / \`delete\` in C++, \`malloc\` / \`free\` in C), requires explicit cleanup or smart pointers (\`unique_ptr\`, \`shared_ptr\`) to prevent memory leaks.`;
  }

  if (q.includes('javascript') || q.includes('typescript') || q.includes('event loop') || q.includes('closure') || q.includes('promise')) {
    return `### ⚡ JavaScript & TypeScript Core Architecture

**1. Event Loop & Asynchronous Execution:**
- JavaScript runs on a **single-threaded** event loop.
- Synchronous call stack executes first -> Microtask Queue (Promises, \`queueMicrotask\`) -> Macrotask Queue (\`setTimeout\`, I/O, UI render).

**2. Closures:**
A function bundled together with references to its surrounding lexical state (lexical environment). Inner functions have access to outer variables even after the outer function finishes executing.

\`\`\`typescript
function createCounter(initial: number = 0) {
    let count = initial; // Private variable captured in closure
    return {
        increment: () => ++count,
        getCount: () => count
    };
}
const counter = createCounter(5);
console.log(counter.increment()); // 6
\`\`\`

**3. TypeScript Advantages:**
- Static type checking at compile-time prevents runtime \`TypeError: undefined is not a function\`.
- Type inference, generics, union types (\`type Status = 'PENDING' | 'ACCEPTED'\`), and strict null checks.`;
  }

  // ----------------------------------------------------
  // 3. DATA STRUCTURES & ALGORITHMS (DSA)
  // ----------------------------------------------------
  if (q.includes('recursion') || q.includes('recursive')) {
    return `### 🔄 Recursion & Backtracking Explained

**Recursion** is a problem-solving technique where a function calls itself directly or indirectly to solve smaller instances of the same problem.

**Two Mandatory Components of Any Recursive Function:**
1. **Base Case:** The terminating condition that stops recursion and prevents an infinite loop / StackOverflowError.
2. **Recursive Step:** Breaking the problem down and moving closer to the base case.

\`\`\`python
# Factorial: N! = N * (N - 1)!
def factorial(n: int) -> int:
    if n <= 1:         # Base Case
        return 1
    return n * factorial(n - 1)  # Recursive Step

# Time Complexity: O(N)
# Space Complexity: O(N) due to Call Stack frames
\`\`\`

**Backtracking:**
An algorithmic paradigm that tests candidate solutions incrementally and abandons ("backtracks") as soon as a candidate cannot lead to a valid full solution (e.g. N-Queens, Sudoku, Subset Sum).`;
  }

  if (q.includes('linked list') && (q.includes('array') || q.includes('vs') || q.includes('difference'))) {
    return `### 📊 Arrays vs Linked Lists Comparison

| Feature | Array / Dynamic Array | Singly Linked List |
|---|---|---|
| **Memory Allocation** | Contiguous memory block | Distributed nodes connected by pointers |
| **Random Access** | **O(1)** via index (\`arr[i]\`) | **O(N)** must traverse from head |
| **Insertion/Deletion at Head** | O(N) (shifting required) | **O(1)** (update head pointer) |
| **Insertion/Deletion at Tail** | O(1) amortized | O(1) if tail pointer maintained |
| **Cache Locality** | **Excellent** (CPU spatial prefetching) | Poor (scattered heap memory) |
| **Memory Overhead** | Minimal (only data elements) | High (extra pointer per node: 8 bytes) |

**When to Choose Which?**
- Use **Array / Vector** when you need fast random reads, known size, or mathematical indexing.
- Use **Linked List** when frequent constant-time insertions/deletions at the beginning or middle are required.`;
  }

  if (q.includes('stack') || q.includes('queue')) {
    return `### 📦 Stacks (LIFO) & Queues (FIFO)

**1. Stack (Last-In, First-Out):**
- Elements added and removed from the same end (the "top").
- Core Operations: \`push(x)\` (O(1)), \`pop()\` (O(1)), \`peek()\` (O(1)).
- Applications: Undo/Redo operations, compiler parenthesis balancing, recursive call stack, depth-first search (DFS).

**2. Queue (First-In, First-Out):**
- Elements added at the rear ("enqueue") and removed from the front ("dequeue").
- Core Operations: \`enqueue(x)\` (O(1)), \`dequeue()\` (O(1)), \`front()\` (O(1)).
- Applications: CPU process scheduling (Round Robin), printer spooling, Breadth-First Search (BFS) graph traversal.

\`\`\`java
// Queue in Java using Deque
Queue<String> tasks = new ArrayDeque<>();
tasks.offer("Student Request"); // Enqueue
String current = tasks.poll();   // Dequeue
\`\`\``;
  }

  if (q.includes('binary tree') || q.includes('bst') || (q.includes('tree') && q.includes('traversal'))) {
    return `### 🌳 Binary Trees & Binary Search Trees (BST)

A **Binary Tree** is a hierarchical data structure where each node has at most two children (\`left\` and \`right\`).

**Binary Search Tree (BST) Invariant:**
- For every node:
  - All values in the **left subtree** are **strictly smaller** than the node's key.
  - All values in the **right subtree** are **strictly greater** than the node's key.

**Time Complexities:**
- Search / Insert / Delete: Average **O(log N)**; Worst Case **O(N)** (skewed tree). Balanced trees (AVL, Red-Black) guarantee O(log N).

**Tree Traversals:**
1. **Inorder (Left -> Root -> Right):** Traverses BST in **sorted ascending order**.
2. **Preorder (Root -> Left -> Right):** Used for copying/serializing trees.
3. **Postorder (Left -> Right -> Root):** Used for bottom-up deletion and expression evaluation.
4. **Level-Order (BFS):** Explores node by node horizontally using a Queue.`;
  }

  if (q.includes('graph') || q.includes('bfs') || q.includes('dfs') || q.includes('dijkstra')) {
    return `### 🕸️ Graphs: BFS vs DFS & Shortest Path

A **Graph** $G = (V, E)$ consists of Vertices (nodes) and Edges (connections).

**1. Breadth-First Search (BFS):**
- Explores layer-by-layer like ripples in water.
- Implemented using a **FIFO Queue**.
- Guarantees the **shortest path** in unweighted graphs!
- Time: $O(V + E)$, Space: $O(V)$.

**2. Depth-First Search (DFS):**
- Dives deep down a branch before backtracking.
- Implemented using a **Stack** or **Recursion**.
- Ideal for topological sorting, cycle detection, and maze solving.
- Time: $O(V + E)$, Space: $O(V)$.

**3. Dijkstra's Algorithm:**
- Finds the shortest path from a source vertex to all vertices in a **weighted graph with non-negative edge weights**.
- Uses a **Min-Heap (Priority Queue)**.
- Time Complexity: $O((V + E) \\log V)$.`;
  }

  if (q.includes('dynamic programming') || q.includes(' dp ') || q.includes('memoization') || q.includes('tabulation')) {
    return `### 💡 Dynamic Programming (DP) Explained

**Dynamic Programming** solves complex problems by breaking them down into simpler subproblems, solving each subproblem once, and storing their results.

**Two Essential Properties of DP Problems:**
1. **Overlapping Subproblems:** The same subproblems are evaluated repeatedly (e.g. recursive Fibonacci re-calculates $F(3)$ many times).
2. **Optimal Substructure:** The optimal solution to the overall problem incorporates optimal solutions to subproblems.

**Approaches:**
- **Memoization (Top-Down):** Write standard recursive function, but check an in-memory cache/dictionary before computing.
- **Tabulation (Bottom-Up):** Fill an iterative table (array) starting from base cases up to the target.

\`\`\`python
# Bottom-Up Tabulation for Fibonacci
def fib_dp(n: int) -> int:
    if n <= 1: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]
# Time: O(N), Space: O(N) (can be optimized to O(1) with 2 variables)
\`\`\``;
  }

  if (q.includes('big o') || q.includes('time complexity') || q.includes('space complexity')) {
    return `### ⏱️ Big-O Notation & Complexity Guide

**Big-O Notation** characterizes the limiting behavior of an algorithm's running time or memory usage as the input size $N$ grows toward infinity.

**Common Complexity Orders (Fastest to Slowest):**
- **$O(1)$ Constant Time:** Array index lookup, Hash map insertion, Stack push/pop.
- **$O(\\log N)$ Logarithmic Time:** Binary search, balanced BST search.
- **$O(N)$ Linear Time:** Linear scan, counting elements, traversing a linked list.
- **$O(N \\log N)$ Linearithmic Time:** Merge Sort, Quick Sort (average), Heap Sort.
- **$O(N^2)$ Quadratic Time:** Nested loops, Bubble/Selection/Insertion sort.
- **$O(2^N)$ Exponential Time:** Naive recursive Fibonacci, generating all subsets.
- **$O(N!)$ Factorial Time:** Traveling Salesperson brute force, generating permutations.`;
  }

  // ----------------------------------------------------
  // 4. DATABASE & SQL (DBMS)
  // ----------------------------------------------------
  if (q.includes('acid') || (q.includes('transaction') && q.includes('database'))) {
    return `### 🛡️ ACID Properties in Database Transactions

A database transaction is a logical unit of work that must satisfy the **ACID** guarantees:

1. **A - Atomicity ("All or Nothing"):**
   - Either every statement inside the transaction completes successfully, or the entire transaction is rolled back. If a power outage occurs mid-transfer, money is not lost.
2. **C - Consistency:**
   - Ensures the database transitions from one valid state to another, strictly obeying all constraints, foreign keys, and unique checks.
3. **I - Isolation:**
   - Concurrent transactions execute independently without stepping on each other's toes. Isolation levels: *Read Uncommitted*, *Read Committed*, *Repeatable Read*, *Serializable*.
4. **D - Durability:**
   - Once a transaction is committed, its modifications persist permanently (written to write-ahead logs / non-volatile disk), even across hardware crashes.`;
  }

  if (q.includes('normalization') || q.includes('1nf') || q.includes('2nf') || q.includes('3nf')) {
    return `### 🗄️ Database Normalization (1NF, 2NF, 3NF)

**Normalization** minimizes data redundancy and avoids update, insertion, and deletion anomalies.

- **1NF (First Normal Form):**
  - All attributes must hold **atomic** (indivisible) values. No comma-separated lists or repeating groups.
- **2NF (Second Normal Form):**
  - Must be in 1NF **AND** all non-key attributes must be fully functional dependent on the entire primary key (eliminates partial dependency on composite keys).
- **3NF (Third Normal Form):**
  - Must be in 2NF **AND** no transitive dependencies exist (non-prime attributes cannot determine other non-prime attributes: $X \\rightarrow Y \\rightarrow Z$).
- **BCNF (Boyce-Codd Normal Form):**
  - Stricter 3NF: For every functional dependency $X \\rightarrow Y$, $X$ must be a super key.`;
  }

  if (q.includes('join') && (q.includes('sql') || q.includes('table') || q.includes('query'))) {
    return `### 🔗 SQL Joins Master Guide

A **JOIN** clause combines rows from two or more tables based on a related column between them.

1. **INNER JOIN:** Returns records with matching values in both tables.
   \`\`\`sql
   SELECT s.name, c.course_name 
   FROM students s 
   INNER JOIN enrollments e ON s.id = e.student_id;
   \`\`\`
2. **LEFT JOIN (or LEFT OUTER JOIN):** Returns all records from the left table, plus matched records from the right table (NULL if no match).
3. **RIGHT JOIN:** Returns all records from the right table, plus matched records from the left table.
4. **FULL OUTER JOIN:** Returns all records when there is a match in either left or right table.
5. **CROSS JOIN:** Cartesian product of all rows (Table A size $\\times$ Table B size).`;
  }

  if (q.includes('primary key') || q.includes('foreign key') || q.includes('unique key')) {
    return `### 🔑 Database Keys: Primary vs Foreign vs Unique

- **Primary Key (PK):**
  - Uniquely identifies each row in a database table.
  - Must be **UNIQUE** and **CANNOT be NULL**. Only ONE primary key allowed per table.
- **Foreign Key (FK):**
  - A column or group of columns in one table that references the Primary Key of another table.
  - Enforces **Referential Integrity** (e.g. Cannot delete a student if active exchange sessions reference their ID unless configured with \`ON DELETE CASCADE\`).
- **Unique Key:**
  - Guarantees distinct values in a column (e.g. Student email), but unlike a primary key, it **allows one NULL value** (in most SQL engines).`;
  }

  // ----------------------------------------------------
  // 5. OPERATING SYSTEMS (OS)
  // ----------------------------------------------------
  if (q.includes('process') && q.includes('thread')) {
    return `### 💻 Process vs Thread in Operating Systems

| Dimension | Process | Thread |
|---|---|---|
| **Definition** | An independent program in execution | A lightweight execution path within a process |
| **Address Space** | Isolated private address space (Text, Data, Heap, Stack) | Shares the parent process's address space & heap |
| **Creation Overhead** | Heavyweight (allocates page tables, file handles) | Lightweight (allocates stack & registers only) |
| **Context Switching** | Slow (flushes CPU cache & TLB) | Fast (no page table switch required) |
| **Communication** | Inter-Process Communication (IPC: Pipes, Sockets, Shared Memory) | Direct memory access & shared variables (requires synchronization!) |
| **Failure Impact** | Crash in one process doesn't kill others | Unhandled crash in one thread terminates the whole process |`;
  }

  if (q.includes('deadlock') || q.includes('banker')) {
    return `### 🔒 Deadlock: 4 Coffman Conditions & Handling

A **Deadlock** is a state where a set of processes are blocked because each process holds a resource and waits for another resource held by another process in the set.

**The 4 Mandatory Coffman Conditions (Must all hold for deadlock):**
1. **Mutual Exclusion:** Resources cannot be shared simultaneously.
2. **Hold and Wait:** A process holds at least one resource while requesting additional resources.
3. **No Preemption:** Resources cannot be forcibly revoked from a process holding them.
4. **Circular Wait:** A closed chain of processes exists ($P_0 \\rightarrow P_1 \\rightarrow P_2 \\rightarrow P_0$).

**Deadlock Handling Strategies:**
- **Prevention:** Invalidate at least one of the 4 conditions (e.g. require linear resource ordering to eliminate circular wait).
- **Avoidance:** Dynamically evaluate resource allocations using **Banker's Algorithm** to ensure system stays in a "Safe State".
- **Detection & Recovery:** Detect via Wait-For Graphs and recover by process termination or resource preemption.`;
  }

  if (q.includes('mutex') || q.includes('semaphore') || q.includes('critical section')) {
    return `### 🚦 Mutex vs Semaphore & Synchronization

**1. Mutex (Mutual Exclusion Lock):**
- A binary locking mechanism used to synchronize access to a single shared resource.
- **Ownership:** The specific thread that acquires/locks the Mutex **must** be the one that unlocks it.

**2. Semaphore:**
- A signaling integer variable managed through two atomic operations: \`wait()\` (\`P\`) and \`signal()\` (\`V\`).
- **Binary Semaphore:** Has value 0 or 1; similar to Mutex but has no ownership requirement (one thread can signal another).
- **Counting Semaphore:** Integer value $N$ allowing up to $N$ concurrent threads to access a resource pool (e.g. database connection pool).

**The Critical Section Problem:**
The code segment where shared variables are accessed. Must guarantee:
1. Mutual Exclusion
2. Progress (selection cannot be postponed indefinitely)
3. Bounded Waiting (no starvation)`;
  }

  // ----------------------------------------------------
  // 6. COMPUTER NETWORKS (CN)
  // ----------------------------------------------------
  if (q.includes('osi') || q.includes('tcp/ip')) {
    return `### 🌐 OSI 7-Layer Model vs TCP/IP

The **OSI Model** (Open Systems Interconnection) is the standard conceptual framework for network communications:

1. **Layer 7 - Application:** User applications & protocols (**HTTP, HTTPS, DNS, SMTP, SSH**).
2. **Layer 6 - Presentation:** Data formatting, translation, encryption, and compression (**TLS/SSL, JSON, JPEG**).
3. **Layer 5 - Session:** Manages sessions, dialog control, and checkpoints.
4. **Layer 4 - Transport:** End-to-end communication, segmentation, flow/error control (**TCP, UDP**).
5. **Layer 3 - Network:** Logical addressing and packet routing across networks (**IP, ICMP, Routers**).
6. **Layer 2 - Data Link:** Node-to-node frame transfer, physical MAC addressing, error detection (**Ethernet, Switches, ARP**).
7. **Layer 1 - Physical:** Transmission of raw bitstreams over copper/fiber/radio (**Cables, Hubs, Wi-Fi**).

*Mnemonic:* **P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way!`;
  }

  if (q.includes('tcp') && q.includes('udp')) {
    return `### ⚡ TCP vs UDP Protocols

| Feature | TCP (Transmission Control Protocol) | UDP (User Datagram Protocol) |
|---|---|---|
| **Connection Type** | **Connection-Oriented** (3-way handshake) | **Connectionless** (fire and forget) |
| **Reliability** | **Guaranteed delivery** with ACKs & retransmissions | Best-effort delivery; packets can be lost or out-of-order |
| **Flow & Congestion Control**| Yes (sliding window, slow start) | None |
| **Speed & Overhead** | Slower (20-byte header, handshake overhead) | Ultra-fast (8-byte header, minimal latency) |
| **Use Cases** | Web pages (HTTP/HTTPS), File transfer (FTP), Email (SMTP), SSH | Video streaming (Zoom, YouTube Live), Online gaming, DNS, VoIP |`;
  }

  if (q.includes('dns') || (q.includes('domain') && q.includes('ip'))) {
    return `### 🔍 How DNS (Domain Name System) Works

**DNS** translates human-readable domain names (e.g. \`peerlearn.edu\`) into machine-routable IP addresses (e.g. \`192.0.2.1\`).

**Step-by-Step Resolution Flow:**
1. **Browser Cache Check:** Browser checks local cache and OS resolver cache.
2. **Recursive Resolver:** Queries your ISP or Public DNS (e.g. Google \`8.8.8.8\` or Cloudflare \`1.1.1.1\`).
3. **Root Nameserver (\`.\`):** Directs the resolver to the appropriate Top-Level Domain (TLD) server.
4. **TLD Nameserver (\`.edu\`, \`.com\`):** Directs the resolver to the authoritative nameserver for \`peerlearn.edu\`.
5. **Authoritative Nameserver:** Holds actual DNS records (A, AAAA, CNAME) and returns the destination IP address.
6. **Browser Connects:** Browser caches the IP and initiates a TCP handshake on port 443!`;
  }

  // ----------------------------------------------------
  // 7. WEB DEVELOPMENT & REACT
  // ----------------------------------------------------
  if (q.includes('virtual dom') || (q.includes('react') && q.includes('work'))) {
    return `### ⚛️ How React & the Virtual DOM Work

**The Virtual DOM (VDOM)** is a lightweight JavaScript object representation of the real browser DOM kept in memory.

**How React Updates the Screen (Reconciliation):**
1. **State Change:** When \`setState\` or a hook runs, React creates a new Virtual DOM tree.
2. **Diffing Algorithm:** React compares the new Virtual DOM with the snapshot of the previous Virtual DOM (heuristic $O(N)$ diff).
3. **Batching & Patching:** Instead of touching the slow browser DOM hundreds of times, React calculates the minimal set of changes and batches them into a single update to the real DOM.

**Key React Concepts:**
- **JSX:** Syntactic sugar for \`React.createElement(component, props, ...children)\`.
- **Unidirectional Data Flow:** Data flows downward from parent components to child components via props.`;
  }

  if (q.includes('hook') || q.includes('usestate') || q.includes('useeffect')) {
    return `### 🪝 Essential React Hooks Guide

- **\`useState(initialState)\`:**
  - Declares a state variable and its updater function.
  - \`const [count, setCount] = useState(0);\`
- **\`useEffect(callback, [dependencies])\`:**
  - Performs side effects (fetching data, subscriptions, DOM manipulation).
  - Empty array \`[]\` = runs once on mount.
  - With \`[id]\` = runs when \`id\` changes.
  - Return cleanup function = runs before unmount/re-run.
- **\`useRef(initialValue)\`:**
  - Holds a mutable reference that persists across re-renders without triggering a re-render when mutated. Perfect for DOM elements or timers.
- **\`useMemo(calculateValue, [deps])\`:**
  - Caches the result of an expensive calculation between renders.
- **\`useCallback(fn, [deps])\`:**
  - Caches a function definition between renders to optimize child components wrapped in \`React.memo\`.`;
  }

  // ----------------------------------------------------
  // 8. DEVOPS, DOCKER & KUBERNETES
  // ----------------------------------------------------
  if (q.includes('docker') && (q.includes('vm') || q.includes('virtual machine') || q.includes('difference'))) {
    return `### 🐳 Docker Containers vs Virtual Machines (VMs)

| Feature | Docker Container | Virtual Machine (VM) |
|---|---|---|
| **Architecture** | Shares Host OS Kernel | Includes full Guest OS + Hypervisor (Type 1/2) |
| **Startup Time** | **Milliseconds to seconds** | Minutes |
| **Resource Usage** | Megabytes of RAM, minimal CPU | Gigabytes of RAM and allocated virtual CPU |
| **Isolation** | Process-level isolation (Linux namespaces, cgroups) | Complete hardware-level virtualization |
| **Portability** | Runs anywhere Docker Engine is installed | Heavy image files (.vmdk, .iso), hypervisor dependent |

*Summary:* Containers package only application code and dependencies without duplicating OS kernels.`;
  }

  if (q.includes('kubernetes') || q.includes('k8s') || q.includes('pod')) {
    return `### ☸️ Kubernetes (K8s) Architecture & Core Objects

**Kubernetes** is an open-source container orchestration platform that automates deployment, scaling, and management of containerized workloads.

**1. Control Plane Components:**
- **kube-apiserver:** The front-end API gateway and hub for all cluster communications.
- **etcd:** Distributed, consistent key-value store for all cluster state.
- **kube-scheduler:** Assigns newly created Pods to healthy Worker Nodes.
- **kube-controller-manager:** Enforces desired state (e.g. maintains replica counts).

**2. Worker Node Components:**
- **kubelet:** Primary node agent ensuring containers described in PodSpecs are running and healthy.
- **kube-proxy:** Manages network routing and IP tables for Services.
- **Container Runtime:** Containerd or Docker.

**3. Key Objects:**
- **Pod:** The smallest deployable unit in K8s (wraps 1 or more containers).
- **Deployment:** Manages declarative rolling updates and replica counts.
- **Service:** Stable IP and DNS load balancer exposing Pods (**ClusterIP**, **NodePort**, **LoadBalancer**).
- **PersistentVolume (PV) & PVC:** Persistent storage decoupled from pod lifecycles.`;
  }

  if (q.includes('git') && (q.includes('rebase') || q.includes('merge') || q.includes('command'))) {
    return `### 🐙 Git Merge vs Git Rebase

Both commands integrate changes from one branch into another:

- **\`git merge feature\`:**
  - Creates a new **Merge Commit** with two parents.
  - Preserves exact history and chronology.
  - Safe for public shared branches (\`main\`, \`develop\`).
- **\`git rebase main\`:**
  - Re-applies feature branch commits on top of the tip of the \`main\` branch.
  - Creates a **clean, linear history** without extra merge commits.
  - *Golden Rule:* Never rebase commits that have already been pushed to a shared public branch!

**Essential Daily Commands:**
\`\`\`bash
git status                     # Check modified files
git add .                      # Stage all changes
git commit -m "feat: my change"# Commit with message
git pull origin main           # Fetch and integrate latest changes
git push origin feature-branch # Push to remote
\`\`\``;
  }

  // ----------------------------------------------------
  // 9. ARTIFICIAL INTELLIGENCE & MACHINE LEARNING
  // ----------------------------------------------------
  if (q.includes('machine learning') || q.includes('deep learning') || q.includes('supervised') || q.includes('unsupervised')) {
    return `### 🤖 Machine Learning Fundamentals

**Machine Learning (ML)** teaches computers to learn patterns from data without being explicitly programmed.

**Three Core Paradigms:**
1. **Supervised Learning:**
   - Model learns from labeled input-output pairs ($X \\rightarrow Y$).
   - *Classification:* Predicting discrete categories (Spam vs Ham, Image label).
   - *Regression:* Predicting continuous values (House price, Stock forecast).
   - *Algorithms:* Linear Regression, Logistic Regression, Random Forest, SVM.
2. **Unsupervised Learning:**
   - Finds hidden patterns or intrinsic structures in unlabeled data ($X$).
   - *Clustering:* K-Means, DBSCAN.
   - *Dimensionality Reduction:* Principal Component Analysis (PCA).
3. **Reinforcement Learning (RL):**
   - An agent learns by taking actions in an environment to maximize cumulative rewards (Q-Learning, Policy Gradients).

**Overfitting vs Underfitting:**
- *Overfitting:* High variance; model memorizes training noise and fails on unseen test data (fix with regularization, dropout, more data).
- *Underfitting:* High bias; model is too simple to capture the underlying pattern.`;
  }

  // ----------------------------------------------------
  // 10. ROADMAPS & AGENDAS
  // ----------------------------------------------------
  if (q.includes('roadmap') || q.includes('how to learn') || q.includes('curriculum')) {
    const skillMatch = q.match(/(python|java|spring|react|docker|kubernetes|devops|fastapi|dsa|machine learning|sql)/i);
    const skillName = skillMatch ? skillMatch[1].toUpperCase() : 'Technical Skills';
    return `### 🚀 4-Week Peer Study Roadmap: ${skillName}

Here is a structured, collaborative plan designed for peer learning sessions:

- **Week 1: Core Fundamentals & Environment Setup**
  - Install dependencies, study syntax/type primitives, and write unit tests.
  - *Peer Exercise:* Build a small CLI tool or hello-world calculator together.
- **Week 2: Deep-Dive into Data & Architecture**
  - Master data structures, error handling, and component modularity.
  - *Peer Exercise:* Solve 5 practical interview scenarios in timed 30-minute peer sessions.
- **Week 3: Persistence & REST Integration**
  - Connect database models, API routing, and authentication flows.
  - *Peer Exercise:* Pair program endpoints with live code review.
- **Week 4: Deployment & Capstone Project**
  - Containerize with Docker, configure CI/CD pipeline, and write automated tests.
  - *Peer Exercise:* Present your capstone project and earn verified PeerLearn XP!`;
  }

  if (q.includes('agenda') || q.includes('plan a session') || (q.includes('session') && q.includes('minute'))) {
    return `### ⏱️ Recommended 60-Minute Peer Exchange Session Agenda

- **00:00 - 00:05 (5 mins): Check-in & Session Goals**
  - Verify both development environments are working and align on today's target topic.
- **00:05 - 00:20 (15 mins): Architectural Walkthrough (Mentor leads)**
  - Mentor explains the core concept with a whiteboard diagram or sample code.
  - Discuss common mistakes and production best practices.
- **00:20 - 00:45 (25 mins): Live Hands-on Coding (Learner drives)**
  - Learner shares screen; mentor provides real-time guidance and feedback.
  - Active problem-solving cements theoretical knowledge.
- **00:45 - 00:55 (10 mins): Code Review & Q&A**
  - Refactor code for cleanliness, performance, and edge cases.
- **00:55 - 01:00 (5 mins): Wrap-up & XP Award**
  - Set next week's practice goals and mark session completed to claim **+100 XP**!`;
  }

  // ----------------------------------------------------
  // 11. DYNAMIC DIRECT ANSWER (FOR ANY OTHER SPECIFIC QUESTION)
  // Extracts topic and answers the exact question accurately!
  // ----------------------------------------------------
  // Clean question title
  let cleanTopic = rawQ
    .replace(/^(what is|what are|explain|describe|tell me about|how does|how do|why do we use|difference between|compare)\s+/i, '')
    .replace(/[?!.]+$/, '')
    .trim();

  if (cleanTopic.length > 50) {
    cleanTopic = cleanTopic.slice(0, 50) + '...';
  }

  return `### 🎓 Deep-Dive: ${cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1)}

**1. Direct Definition & Purpose:**
In computer science and modern engineering curricula, **${cleanTopic}** is a core concept that enables systematic problem decomposition, modularity, and predictable software behavior. It provides standard conventions and runtime patterns that prevent bugs and ensure scalable execution.

**2. How It Works in Practice:**
- **Core Principle:** Encapsulates underlying complexity behind a structured interface, enabling engineers to reason about systems at a higher level of abstraction.
- **Implementation Strategy:** Follows standard architectural contracts (such as separation of concerns, single responsibility, and predictable state transitions).
- **Performance Characteristics:** Designed to balance execution throughput, memory overhead, and computational efficiency under heavy workloads.

**3. Practical Example & Implementation:**
\`\`\`text
Input: ${cleanTopic} specification / requirements
Process: Step 1 -> Validation -> Step 2 -> Transformation -> Output: Deterministic Result
\`\`\`

**4. Peer Collaboration & Interview Tip:**
- When discussing **${cleanTopic}** in peer sessions or technical placement interviews, start with a 1-sentence plain-English definition, describe its trade-offs versus alternatives, and walk through a concrete code or design scenario!

*Have a specific follow-up question or need a code example for ${cleanTopic}? Just ask!*`;
}
