'use client';

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import {
  AppUser,
  ChatMessage,
  DisasterType,
  Language,
  RecoveryCase,
  RecoveryTask,
  UserDocument,
} from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getDocumentInfo } from '../data/knowledgeBase';
import { generateId, getAuthorityName } from '../utils/documentHelpers';

interface AppContextType {
  // State
  user: AppUser | null;
  language: Language;
  recoveryCase: RecoveryCase | null;
  documents: UserDocument[];
  tasks: RecoveryTask[];
  chatMessages: ChatMessage[];

  // User & Case Setters
  setUser: (user: AppUser | null) => void;
  setLanguage: (lang: Language) => void;
  setRecoveryCase: (c: RecoveryCase | null) => void;

  // Document Operations
  addDocument: (
    doc: Omit<UserDocument, 'id' | 'createdAt'> | UserDocument,
    autoGenerateTasks?: boolean
  ) => UserDocument;
  updateDocument: (id: string, updates: Partial<UserDocument>) => void;
  removeDocument: (id: string) => void;

  // Task Operations
  addTask: (task: Omit<RecoveryTask, 'id'> | RecoveryTask) => RecoveryTask;
  updateTask: (id: string, updates: Partial<RecoveryTask>) => void;
  removeTask: (id: string) => void;
  generateTasksForDocument: (doc: UserDocument) => RecoveryTask[];

  // Chat Operations
  addChatMessage: (
    msg: Omit<ChatMessage, 'id' | 'timestamp'> | ChatMessage
  ) => ChatMessage;
  clearChat: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// LocalStorage Keys
const STORAGE_KEYS = {
  USER: 'docurecover_user',
  LANGUAGE: 'docurecover_language',
  CASE: 'docurecover_recovery_case',
  DOCUMENTS: 'docurecover_documents',
  TASKS: 'docurecover_tasks',
  CHAT: 'docurecover_chat',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<AppUser | null>(STORAGE_KEYS.USER, null);
  const [language, setLanguage] = useLocalStorage<Language>(STORAGE_KEYS.LANGUAGE, 'en');
  const [recoveryCase, setRecoveryCase] = useLocalStorage<RecoveryCase | null>(
    STORAGE_KEYS.CASE,
    null
  );
  const [documents, setDocuments] = useLocalStorage<UserDocument[]>(
    STORAGE_KEYS.DOCUMENTS,
    []
  );
  const [tasks, setTasks] = useLocalStorage<RecoveryTask[]>(STORAGE_KEYS.TASKS, []);
  const [chatMessages, setChatMessages] = useLocalStorage<ChatMessage[]>(
    STORAGE_KEYS.CHAT,
    []
  );

  /**
   * Generates step-by-step tasks based on the Malaysian Knowledge Base for a document
   */
  const generateTasksForDocument = useCallback(
    (doc: UserDocument): RecoveryTask[] => {
      const info = getDocumentInfo(doc.type);
      if (!info) return [];

      const procedures = language === 'ms' ? info.procedure.ms : info.procedure.en;
      return procedures.map((stepText, idx) => {
        // Derive a clean, concise title from the first sentence or colon
        const firstSegment = stepText.split(/[:.]/)[0];
        const title =
          firstSegment && firstSegment.length < 55
            ? firstSegment.trim()
            : `${language === 'ms' ? 'Langkah' : 'Step'} ${idx + 1}: ${doc.name}`;

        return {
          id: generateId(),
          documentId: doc.id,
          documentType: doc.type,
          documentName: doc.name,
          title,
          description: stepText,
          completed: false,
          link: info.applicationLink || info.website,
          stepNumber: idx + 1,
        };
      });
    },
    [language]
  );

  /**
   * Adds a new document and optionally auto-generates associated recovery checklist tasks
   */
  const addDocument = useCallback(
    (
      docInput: Omit<UserDocument, 'id' | 'createdAt'> | UserDocument,
      autoGenerateTasks: boolean = true
    ): UserDocument => {
      const newDoc: UserDocument = {
        ...docInput,
        id: 'id' in docInput && docInput.id ? docInput.id : generateId(),
        createdAt:
          'createdAt' in docInput && docInput.createdAt
            ? docInput.createdAt
            : new Date().toISOString(),
        authority: docInput.authority || getAuthorityName(docInput.type),
        recoveryProgress: docInput.recoveryProgress ?? 0,
      };

      setDocuments((prevDocs) => [...prevDocs, newDoc]);

      if (autoGenerateTasks) {
        const generatedTasks = generateTasksForDocument(newDoc);
        if (generatedTasks.length > 0) {
          setTasks((prevTasks) => [...prevTasks, ...generatedTasks]);
        }
      }

      return newDoc;
    },
    [generateTasksForDocument, setDocuments, setTasks]
  );

  /**
   * Updates an existing document's properties
   */
  const updateDocument = useCallback(
    (id: string, updates: Partial<UserDocument>) => {
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
      );
    },
    [setDocuments]
  );

  /**
   * Removes a document and cascades deletion of its associated recovery tasks
   */
  const removeDocument = useCallback(
    (id: string) => {
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setTasks((prev) => prev.filter((task) => task.documentId !== id));
    },
    [setDocuments, setTasks]
  );

  /**
   * Adds a standalone task to the recovery checklist
   */
  const addTask = useCallback(
    (taskInput: Omit<RecoveryTask, 'id'> | RecoveryTask): RecoveryTask => {
      const newTask: RecoveryTask = {
        ...taskInput,
        id: 'id' in taskInput && taskInput.id ? taskInput.id : generateId(),
      };
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    },
    [setTasks]
  );

  /**
   * Updates a recovery task and recalculates the corresponding document's progress percentage
   */
  const updateTask = useCallback(
    (id: string, updates: Partial<RecoveryTask>) => {
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        );

        // Recalculate progress for the affected document
        const targetTask = updatedTasks.find((t) => t.id === id);
        if (targetTask?.documentId) {
          const docTasks = updatedTasks.filter(
            (t) => t.documentId === targetTask.documentId
          );
          if (docTasks.length > 0) {
            const completedCount = docTasks.filter((t) => t.completed).length;
            const newProgress = Math.round(
              (completedCount / docTasks.length) * 100
            );

            // Update document's progress
            setDocuments((prevDocs) =>
              prevDocs.map((doc) =>
                doc.id === targetTask.documentId
                  ? {
                      ...doc,
                      recoveryProgress: newProgress,
                      status:
                        newProgress === 100
                          ? 'recovered'
                          : doc.status === 'recovered'
                          ? 'damaged'
                          : doc.status,
                    }
                  : doc
              )
            );
          }
        }

        return updatedTasks;
      });
    },
    [setTasks, setDocuments]
  );

  /**
   * Removes a single task
   */
  const removeTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    },
    [setTasks]
  );

  /**
   * Adds a chat message to history
   */
  const addChatMessage = useCallback(
    (msgInput: Omit<ChatMessage, 'id' | 'timestamp'> | ChatMessage): ChatMessage => {
      const newMsg: ChatMessage = {
        ...msgInput,
        id: 'id' in msgInput && msgInput.id ? msgInput.id : generateId(),
        timestamp:
          'timestamp' in msgInput && msgInput.timestamp
            ? msgInput.timestamp
            : new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, newMsg]);
      return newMsg;
    },
    [setChatMessages]
  );

  /**
   * Clears all chat messages from localStorage
   */
  const clearChat = useCallback(() => {
    setChatMessages([]);
  }, [setChatMessages]);

  return (
    <AppContext.Provider
      value={{
        user,
        language,
        recoveryCase,
        documents,
        tasks,
        chatMessages,
        setUser,
        setLanguage,
        setRecoveryCase,
        addDocument,
        updateDocument,
        removeDocument,
        addTask,
        updateTask,
        removeTask,
        generateTasksForDocument,
        addChatMessage,
        clearChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/**
 * Access hook for AppContext with non-null assertion check
 */
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
