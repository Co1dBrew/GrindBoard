import "dotenv/config";
import { MongoClient } from "mongodb";

// realistic LeetCode-style data
const TOPICS = [
    "Array",
    "String",
    "Hash Table",
    "Dynamic Programming",
    "Math",
    "Sorting",
    "Greedy",
    "Depth-First Search",
    "Binary Search",
    "Breadth-First Search",
    "Tree",
    "Matrix",
    "Bit Manipulation",
    "Two Pointers",
    "Stack",
    "Heap",
    "Graph",
    "Linked List",
    "Sliding Window",
    "Backtracking",
    "Union Find",
    "Trie",
    "Recursion",
    "Divide and Conquer",
];

const COMPANIES = [
    "Google",
    "Amazon",
    "Meta",
    "Apple",
    "Microsoft",
    "Netflix",
    "Uber",
    "Airbnb",
    "LinkedIn",
    "Bloomberg",
    "Oracle",
    "Salesforce",
    "Adobe",
    "Snap",
    "Twitter",
    "Spotify",
    "Tesla",
    "ByteDance",
    "Goldman Sachs",
    "JPMorgan",
];

const DIFFICULTIES = ["Easy", "Med", "Hard"];

const QUESTION_NAMES = [
    "Two Sum",
    "Add Two Numbers",
    "Longest Substring Without Repeating Characters",
    "Median of Two Sorted Arrays",
    "Longest Palindromic Substring",
    "Zigzag Conversion",
    "Reverse Integer",
    "String to Integer (atoi)",
    "Palindrome Number",
    "Regular Expression Matching",
    "Container With Most Water",
    "Integer to Roman",
    "Roman to Integer",
    "Longest Common Prefix",
    "3Sum",
    "3Sum Closest",
    "Letter Combinations of a Phone Number",
    "4Sum",
    "Remove Nth Node From End of List",
    "Valid Parentheses",
    "Merge Two Sorted Lists",
    "Generate Parentheses",
    "Merge k Sorted Lists",
    "Swap Nodes in Pairs",
    "Reverse Nodes in k-Group",
    "Remove Duplicates from Sorted Array",
    "Remove Element",
    "Find the Index of the First Occurrence in a String",
    "Divide Two Integers",
    "Substring with Concatenation of All Words",
    "Next Permutation",
    "Longest Valid Parentheses",
    "Search in Rotated Sorted Array",
    "Find First and Last Position",
    "Search Insert Position",
    "Valid Sudoku",
    "Sudoku Solver",
    "Count and Say",
    "Combination Sum",
    "Combination Sum II",
    "First Missing Positive",
    "Trapping Rain Water",
    "Multiply Strings",
    "Wildcard Matching",
    "Jump Game II",
    "Permutations",
    "Permutations II",
    "Rotate Image",
    "Group Anagrams",
    "Pow(x, n)",
    "N-Queens",
    "N-Queens II",
    "Maximum Subarray",
    "Spiral Matrix",
    "Jump Game",
    "Merge Intervals",
    "Insert Interval",
    "Length of Last Word",
    "Plus One",
    "Add Binary",
    "Text Justification",
    "Sqrt(x)",
    "Climbing Stairs",
    "Edit Distance",
    "Set Matrix Zeroes",
    "Search a 2D Matrix",
    "Sort Colors",
    "Minimum Window Substring",
    "Subsets",
    "Word Search",
    "Remove Duplicates from Sorted Array II",
    "Search in Rotated Sorted Array II",
    "Largest Rectangle in Histogram",
    "Maximal Rectangle",
    "Partition List",
    "Merge Sorted Array",
    "Decode Ways",
    "Reverse Linked List II",
    "Restore IP Addresses",
    "Binary Tree Inorder Traversal",
    "Unique Binary Search Trees",
    "Unique Binary Search Trees II",
    "Interleaving String",
    "Validate Binary Search Tree",
    "Recover Binary Search Tree",
    "Same Tree",
    "Symmetric Tree",
    "Binary Tree Level Order Traversal",
    "Binary Tree Zigzag Level Order Traversal",
    "Maximum Depth of Binary Tree",
    "Construct Binary Tree from Preorder and Inorder",
    "Construct Binary Tree from Inorder and Postorder",
    "Balanced Binary Tree",
    "Minimum Depth of Binary Tree",
    "Path Sum",
    "Path Sum II",
    "Flatten Binary Tree to Linked List",
    "Triangle",
    "Best Time to Buy and Sell Stock",
    "Best Time to Buy and Sell Stock II",
    "WordBreak",
    "Linked List Cycle",
    "Linked List Cycle II",
    "LRU Cache",
    "Sort List",
    "Max Points on a Line",
    "Evaluate Reverse Polish Notation",
    "Reverse Words in a String",
    "Maximum Product Subarray",
    "Find Minimum in Rotated Sorted Array",
    "Min Stack",
    "Intersection of Two Linked Lists",
    "Majority Element",
    "House Robber",
    "Number of Islands",
    "Reverse Linked List",
    "Course Schedule",
    "Course Schedule II",
    "Implement Trie (Prefix Tree)",
    "Word Search II",
    "House Robber II",
    "Kth Largest Element in an Array",
    "Combination Sum III",
    "Contains Duplicate",
    "Skyline Problem",
    "Basic Calculator",
    "Basic Calculator II",
    "Lowest Common Ancestor of BST",
    "Lowest Common Ancestor of Binary Tree",
    "Product of Array Except Self",
    "Sliding Window Maximum",
    "Search a 2D Matrix II",
    "Valid Anagram",
    "Meeting Rooms",
    "Meeting Rooms II",
    "Binary Tree Paths",
    "Ugly Number",
    "Ugly Number II",
    "Missing Number",
    "Perfect Squares",
    "Move Zeroes",
    "Find the Duplicate Number",
    "Serialize and Deserialize Binary Tree",
    "Longest Increasing Subsequence",
    "Remove Invalid Parentheses",
    "Best Time Buy Sell with Cooldown",
    "Coin Change",
    "Counting Bits",
    "Top K Frequent Elements",
    "Intersection of Two Arrays II",
    "Design Twitter",
    "Is Subsequence",
    "Decode String",
    "Queue Reconstruction by Height",
    "Partition Equal Subset Sum",
    "Pacific Atlantic Water Flow",
    "Fizz Buzz",
    "Longest Repeating Character Replacement",
    "Non-overlapping Intervals",
    "Find Right Interval",
    "Path Sum III",
    "Find All Anagrams in a String",
    "Arranging Coins",
    "String Compression",
    "Add Strings",
    "Target Sum",
    "Diagonal Traverse",
    "Find All Duplicates in an Array",
    "Hamming Distance",
    "Task Scheduler",
    "Subarray Sum Equals K",
    "Shortest Unsorted Continuous Subarray",
    "Daily Temperatures",
    "Accounts Merge",
    "Redundant Connection",
    "Number of Longest Increasing Subsequence",
    "Longest Continuous Increasing Subsequence",
    "Maximum Length of Pair Chain",
    "Palindromic Substrings",
    "Flood Fill",
    "Network Delay Time",
    "Min Cost Climbing Stairs",
    "Asteroid Collision",
    "My Calendar I",
    "Reorganize String",
    "Max Area of Island",
    "Jewels and Stones",
    "Toeplitz Matrix",
    "Unique Morse Code Words",
    "Backspace String Compare",
    "Buddy Strings",
    "Lemonade Change",
    "Leaf-Similar Trees",
    "Middle of the Linked List",
    "Bitwise ORs of Subarrays",
    "Online Stock Span",
    "Flip Equivalent Binary Trees",
    "Interval List Intersections",
    "Capacity To Ship Packages Within D Days",
    "Rotting Oranges",
    "Longest String Chain",
    "Last Stone Weight",
    "Remove All Adjacent Duplicates In String",
    "Maximum Sum Circular Subarray",
    "Binary Search Tree to Greater Sum Tree",
    "Longest Arithmetic Subsequence",
    "Maximum Level Sum of a Binary Tree",
    "Deepest Leaves Sum",
    "Remove Zero Sum Consecutive Nodes",
    "Check If a Number Is Majority Element",
    "All Paths From Source Lead to Destination",
    "Decrease Elements to Make Array Zigzag",
];

function randomPick(arr, min = 1, max = 3) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
    return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
}

async function seed() {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/grindboard";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        console.log("Connected to:", db.databaseName);

        // clear existing data
        await db.collection("questions").deleteMany({});
        await db.collection("practice_sessions").deleteMany({});
        console.log("Cleared existing data.");

        // generate 200 questions
        const questions = [];
        for (let i = 0; i < QUESTION_NAMES.length; i++) {
            const name = QUESTION_NAMES[i];
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, "")
                .replace(/\s+/g, "-");

            questions.push({
                title: name,
                link: `https://leetcode.com/problems/${slug}/`,
                company: randomPick(COMPANIES, 1, 4),
                topic: randomPick(TOPICS, 1, 3),
                difficulty: DIFFICULTIES[randomInt(0, 2)],
                createdAt: randomDate(
                    new Date("2024-06-01"),
                    new Date("2025-02-01"),
                ),
                updatedAt: new Date(),
            });
        }

        const insertedQuestions = await db
            .collection("questions")
            .insertMany(questions);
        const qIds = Object.values(insertedQuestions.insertedIds);
        console.log(`Inserted ${qIds.length} questions.`);

        // generate 1100 practice sessions (for rubric > 1000 records)
        console.log("Generating 1100 practice sessions...");
        const sessions = [];
        const results = ["Solved", "Unsolved", "Partial"];

        const noteTemplates = [
            "Used two-pointer approach, worked well.",
            "Got stuck on edge cases, need to review.",
            "Optimal solution uses DP, I used brute force.",
            "Solved it but took too long, need to speed up.",
            "Clean solution with hash map.",
            "Couldn't figure out the recursive approach.",
            "Revisit this one — tricky base case.",
            "Nailed it! Much faster than last time.",
            "Need to practice this pattern more.",
            "Good progress, got the approach right but had a bug.",
            "",
            "",
            "",
        ];

        for (let i = 0; i < 1100; i++) {
            const qId = qIds[randomInt(0, qIds.length - 1)];
            sessions.push({
                questionId: qId.toString(),
                timeSpent: randomInt(5, 60),
                result: results[randomInt(0, 2)],
                notes: noteTemplates[randomInt(0, noteTemplates.length - 1)],
                date: randomDate(
                    new Date("2024-06-01"),
                    new Date("2025-02-15"),
                ),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        await db.collection("practice_sessions").insertMany(sessions);
        console.log(`Inserted ${sessions.length} practice sessions.`);
        console.log("Seeding complete!");
    } catch (err) {
        console.error("Seed error:", err);
    } finally {
        await client.close();
    }
}

seed();
