import React, { createContext, useContext, useEffect, useState } from "react";

const LibraryContext = createContext();

const defaultBooks = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self Development",
    language: "English",
    total: 12,
    available: 8,
  },
  {
    id: 2,
    title: "Peer-e-Kamil",
    author: "Umera Ahmed",
    category: "Urdu Fiction",
    language: "Urdu",
    total: 10,
    available: 4,
  },
  {
    id: 3,
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Technology",
    language: "English",
    total: 8,
    available: 5,
  },
  {
    id: 4,
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Fiction",
    language: "English",
    total: 15,
    available: 11,
  },
  {
    id: 5,
    title: "Aangan",
    author: "Khadija Mastoor",
    category: "Urdu Literature",
    language: "Urdu",
    total: 7,
    available: 3,
  },
  {
    id: 6,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Business",
    language: "English",
    total: 9,
    available: 6,
  },
];

const defaultMembers = [
  {
    id: 1,
    name: "Ayesha Khan",
    email: "ayesha@example.com",
    phone: "+92 300 1111111",
    membership: "RM-1001",
    borrowed: 2,
    status: "Active",
    joined: "Oct 01, 2026",
  },
  {
    id: 2,
    name: "Hamza Ahmed",
    email: "hamza@example.com",
    phone: "+92 300 2222222",
    membership: "RM-1002",
    borrowed: 1,
    status: "Active",
    joined: "Sep 28, 2026",
  },
  {
    id: 3,
    name: "Mariam Siddiqui",
    email: "mariam@example.com",
    phone: "+92 300 3333333",
    membership: "RM-1003",
    borrowed: 3,
    status: "Active",
    joined: "Sep 25, 2026",
  },
  {
    id: 4,
    name: "Zain Ali",
    email: "zain@example.com",
    phone: "+92 300 4444444",
    membership: "RM-1004",
    borrowed: 0,
    status: "Active",
    joined: "Sep 20, 2026",
  },
  {
    id: 5,
    name: "Fatima Noor",
    email: "fatima@example.com",
    phone: "+92 300 5555555",
    membership: "RM-1005",
    borrowed: 1,
    status: "Active",
    joined: "Sep 18, 2026",
  },
  {
    id: 6,
    name: "Usman Tariq",
    email: "usman@example.com",
    phone: "+92 300 6666666",
    membership: "RM-1006",
    borrowed: 0,
    status: "Inactive",
    joined: "Sep 10, 2026",
  },
];

const defaultRecords = [
  {
    id: "BR-1001",
    memberId: 1,
    member: "Ayesha Khan",
    membership: "RM-1001",
    bookId: 1,
    book: "Atomic Habits",
    author: "James Clear",
    issueDate: "Oct 04, 2026",
    dueDate: "Oct 11, 2026",
    returnDate: "-",
    status: "Active",
  },
  {
    id: "BR-1002",
    memberId: 2,
    member: "Hamza Ahmed",
    membership: "RM-1002",
    bookId: 3,
    book: "Clean Code",
    author: "Robert C. Martin",
    issueDate: "Oct 03, 2026",
    dueDate: "Oct 10, 2026",
    returnDate: "-",
    status: "Active",
  },
  {
    id: "BR-1003",
    memberId: 3,
    member: "Mariam Siddiqui",
    membership: "RM-1003",
    bookId: 2,
    book: "Peer-e-Kamil",
    author: "Umera Ahmed",
    issueDate: "Oct 02, 2026",
    dueDate: "Oct 09, 2026",
    returnDate: "-",
    status: "Active",
  },
  {
    id: "BR-1004",
    memberId: 4,
    member: "Zain Ali",
    membership: "RM-1004",
    bookId: 4,
    book: "The Alchemist",
    author: "Paulo Coelho",
    issueDate: "Sep 29, 2026",
    dueDate: "Oct 06, 2026",
    returnDate: "-",
    status: "Overdue",
  },
  {
    id: "BR-1005",
    memberId: 5,
    member: "Fatima Noor",
    membership: "RM-1005",
    bookId: 5,
    book: "Aangan",
    author: "Khadija Mastoor",
    issueDate: "Sep 20, 2026",
    dueDate: "Sep 27, 2026",
    returnDate: "Sep 26, 2026",
    status: "Returned",
  },
];

function getStoredData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return fallback;
    }

    return JSON.parse(saved);
  } catch {
    return fallback;
  }
}

export function LibraryProvider({ children }) {
  const [books, setBooks] = useState(() =>
    getStoredData("roshni_library_books", defaultBooks)
  );

  const [members, setMembers] = useState(() =>
    getStoredData("roshni_library_members", defaultMembers)
  );

  const [records, setRecords] = useState(() =>
    getStoredData("roshni_borrowing_records", defaultRecords)
  );

  useEffect(() => {
    localStorage.setItem(
      "roshni_library_books",
      JSON.stringify(books)
    );
  }, [books]);

  useEffect(() => {
    localStorage.setItem(
      "roshni_library_members",
      JSON.stringify(members)
    );
  }, [members]);

  useEffect(() => {
    localStorage.setItem(
      "roshni_borrowing_records",
      JSON.stringify(records)
    );
  }, [records]);

  const issueBook = ({
    book,
    member,
    issueDate,
    dueDate,
  }) => {
    if (!book || !member) {
      return {
        success: false,
        message: "Please select a book and member.",
      };
    }

    if (book.available <= 0) {
      return {
        success: false,
        message: "This book is currently unavailable.",
      };
    }

    const memberFromState = members.find(
      (item) => item.id === member.id
    );

    const bookFromState = books.find(
      (item) => item.id === book.id
    );

    if (!memberFromState || !bookFromState) {
      return {
        success: false,
        message: "Book or member could not be found.",
      };
    }

    if (memberFromState.status !== "Active") {
      return {
        success: false,
        message: "This member is inactive.",
      };
    }

    if (memberFromState.borrowed >= 3) {
      return {
        success: false,
        message:
          "This member has reached the maximum borrowing limit.",
      };
    }

    const alreadyBorrowed = records.some(
      (record) =>
        record.bookId === book.id &&
        record.memberId === member.id &&
        record.status !== "Returned"
    );

    if (alreadyBorrowed) {
      return {
        success: false,
        message:
          "This member already has this book issued.",
      };
    }

    const newRecordNumber =
      records.reduce((max, record) => {
        const number = Number(
          String(record.id).replace("BR-", "")
        );

        return Number.isNaN(number) ? max : Math.max(max, number);
      }, 1000) + 1;

    const newRecord = {
      id: `BR-${newRecordNumber}`,
      memberId: member.id,
      member: memberFromState.name,
      membership: memberFromState.membership,
      bookId: book.id,
      book: bookFromState.title,
      author: bookFromState.author,
      issueDate,
      dueDate,
      returnDate: "-",
      status: "Active",
    };

    setBooks((currentBooks) =>
      currentBooks.map((item) =>
        item.id === book.id
          ? {
              ...item,
              available: Math.max(0, item.available - 1),
            }
          : item
      )
    );

    setMembers((currentMembers) =>
      currentMembers.map((item) =>
        item.id === member.id
          ? {
              ...item,
              borrowed: item.borrowed + 1,
            }
          : item
      )
    );

    setRecords((currentRecords) => [
      newRecord,
      ...currentRecords,
    ]);

    return {
      success: true,
      message: `"${bookFromState.title}" has been issued to ${memberFromState.name}.`,
    };
  };

  const returnBook = ({
    recordId,
    returnDate,
  }) => {
    const record = records.find(
      (item) => item.id === recordId
    );

    if (!record) {
      return {
        success: false,
        message: "Borrowing record not found.",
      };
    }

    if (record.status === "Returned") {
      return {
        success: false,
        message: "This book has already been returned.",
      };
    }

    setBooks((currentBooks) =>
      currentBooks.map((book) =>
        book.id === record.bookId
          ? {
              ...book,
              available: Math.min(
                book.total,
                book.available + 1
              ),
            }
          : book
      )
    );

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === record.memberId
          ? {
              ...member,
              borrowed: Math.max(0, member.borrowed - 1),
            }
          : member
      )
    );

    setRecords((currentRecords) =>
      currentRecords.map((item) =>
        item.id === recordId
          ? {
              ...item,
              returnDate,
              status: "Returned",
            }
          : item
      )
    );

    return {
      success: true,
      message: `"${record.book}" has been returned by ${record.member}.`,
    };
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        setBooks,
        members,
        setMembers,
        records,
        setRecords,
        issueBook,
        returnBook,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error(
      "useLibrary must be used inside LibraryProvider"
    );
  }

  return context;
}