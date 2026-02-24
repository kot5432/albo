"use client"
import { useState, useEffect } from "react"
import Button from "@/components/Button"
import Card from "@/components/Card"
import Input from "@/components/Input"
import Modal from "@/components/Modal"
import { Note } from "@/types"

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = () => {
    const savedNotes = localStorage.getItem('notes')
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes)
        const notesWithDates = parsedNotes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }))
        setNotes(notesWithDates)
      } catch (error) {
        console.error("Failed to load notes:", error)
      }
    }
  }

  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem('notes', JSON.stringify(updatedNotes))
    setNotes(updatedNotes)
  }

  const createNote = () => {
    if (!newNoteContent.trim()) return

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteContent.split('\n')[0].substring(0, 50) || '無題',
      content: newNoteContent,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPromotedToChallenge: false
    }

    const updatedNotes = [newNote, ...notes]
    saveNotes(updatedNotes)
    setNewNoteContent('')
    setShowNewNoteModal(false)
  }

  const updateNote = (noteId: string, content: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, content, updatedAt: new Date() }
        : note
    )
    saveNotes(updatedNotes)
    setEditingNote(null)
  }

  const deleteNote = (noteId: string) => {
    if (confirm('このノートを削除してもよろしいですか？')) {
      const updatedNotes = notes.filter(note => note.id !== noteId)
      saveNotes(updatedNotes)
    }
  }

  const promoteToChallenge = (note: Note) => {
    setSelectedNote(note)
    setShowPromoteModal(true)
  }

  const handlePromoteToChallenge = () => {
    if (!selectedNote) return

    // Create challenge from note
    const challenge = {
      id: Date.now().toString(),
      title: selectedNote.title,
      description: selectedNote.content,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'not_started' as const,
      initialAction: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      firstActionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      actionLogs: [],
      isReasonShared: false,
      retryCount: 0
    }

    // Mark note as promoted
    const updatedNotes = notes.map(note =>
      note.id === selectedNote.id
        ? { ...note, isPromotedToChallenge: true, updatedAt: new Date() }
        : note
    )
    saveNotes(updatedNotes)

    // Save as current challenge
    localStorage.setItem('currentChallenge', JSON.stringify(challenge))
    
    setShowPromoteModal(false)
    setSelectedNote(null)
    
    // Redirect to home
    window.location.href = '/home'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">構想ノート</h1>
          <p className="text-gray-400">アイデアを記録し、挑戦に変える</p>
        </div>

        {/* New Note Button */}
        <div className="mb-8">
          <Button 
            onClick={() => setShowNewNoteModal(true)}
            className="text-lg px-8 py-4"
          >
            新しく書く
          </Button>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <Card className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">まだノートがありません</h3>
              <p className="text-gray-400 mb-6">アイデアや構想を記録してみましょう</p>
              <Button onClick={() => setShowNewNoteModal(true)}>
                新しく書く
              </Button>
            </Card>
          ) : (
            notes.map((note) => (
              <Card key={note.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
                    <div className="text-sm text-gray-400 mb-3">
                      {formatDate(note.updatedAt)}
                      {note.isPromotedToChallenge && (
                        <span className="ml-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                          挑戦に変換済み
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!note.isPromotedToChallenge && (
                      <Button
                        variant="secondary"
                        onClick={() => promoteToChallenge(note)}
                        className="text-sm px-3 py-1"
                      >
                        挑戦にする
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => setEditingNote(note)}
                      className="text-sm px-3 py-1"
                    >
                      編集
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => deleteNote(note.id)}
                      className="text-sm px-3 py-1"
                    >
                      削除
                    </Button>
                  </div>
                </div>

                {/* Note Content */}
                {editingNote?.id === note.id ? (
                  <div className="space-y-3">
                    <Input
                      type="textarea"
                      value={editingNote.content}
                      onChange={(value) => setEditingNote({ ...editingNote, content: value })}
                      rows={6}
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => updateNote(note.id, editingNote.content)}
                        className="text-sm"
                      >
                        保存
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setEditingNote(null)}
                        className="text-sm"
                      >
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-300 whitespace-pre-wrap">
                    {note.content}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* New Note Modal */}
        <Modal isOpen={showNewNoteModal} onClose={() => setShowNewNoteModal(false)}>
          <h2 className="text-2xl font-bold text-white mb-4">新しいノート</h2>
          <p className="text-gray-300 text-sm mb-6">
            アイデア、挑戦構想、研究テーマなど自由に書いてください
          </p>
          
          <Input
            type="textarea"
            placeholder="例：毎日30分英語を勉強して、海外旅行を楽しみたい"
            value={newNoteContent}
            onChange={setNewNoteContent}
            rows={8}
            className="mb-6"
          />
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary" 
              onClick={() => setShowNewNoteModal(false)}
            >
              キャンセル
            </Button>
            <Button 
              onClick={createNote}
              disabled={!newNoteContent.trim()}
            >
              保存する
            </Button>
          </div>
        </Modal>

        {/* Promote to Challenge Modal */}
        <Modal isOpen={showPromoteModal} onClose={() => setShowPromoteModal(false)}>
          <h2 className="text-2xl font-bold text-white mb-4">挑戦に変換</h2>
          <p className="text-gray-300 text-sm mb-6">
            このノートを挑戦に変換しますか？
          </p>
          
          {selectedNote && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-2">{selectedNote.title}</h3>
              <p className="text-gray-300 text-sm line-clamp-3">{selectedNote.content}</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary" 
              onClick={() => setShowPromoteModal(false)}
            >
              キャンセル
            </Button>
            <Button 
              onClick={handlePromoteToChallenge}
            >
              挑戦に変換する
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
