import React, { useRef, useEffect, ReactNode, useState } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "./button";

interface CustomAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  content?: ReactNode;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
}

// Add this new interface for the trigger-based version
interface CustomAlertDialogWithTriggerProps {
  children: ReactNode;
  title: string;
  description?: string;
  content?: ReactNode;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

export function CustomAlertDialog({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  content,
  cancelText = "Cancel",
  confirmText = "Continue",
  onConfirm,
  onCancel,
  variant = 'default'
}: CustomAlertDialogProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        // Alert dialogs typically don't close on outside click
        // But we could add that option if needed
      };
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Close modal with ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCancel();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onCancel]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onOpenChange(false);
  };

  // Portal rendering
  if (typeof window === 'undefined') return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Background overlay */}
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Alert content */}
          <motion.div 
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              ref={modalRef}
              className="bg-card rounded-2xl border border-border shadow-elevation max-w-lg w-full mx-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Alert header */}
              <div className="p-6">
                <div className="flex flex-col space-y-2 text-center sm:text-left">
                  <h2 className="text-xl font-semibold">{title}</h2>
                  {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                  )}
                </div>
              </div>
              
              {/* Alert body (if any) */}
              {content && (
                <div className="px-6 pb-6">
                  {content}
                </div>
              )}

              {/* Alert footer */}
              <div className="p-6 pt-2 border-t border-border">
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                  >
                    {cancelText}
                  </Button>
                  <Button
                    variant={variant === 'destructive' ? 'destructive' : 'default'}
                    onClick={handleConfirm}
                  >
                    {confirmText}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Add this new component that accepts children as trigger
export function CustomAlertDialogWithTrigger({
  children,
  title,
  description,
  content,
  cancelText,
  confirmText,
  onConfirm,
  onCancel,
  variant
}: CustomAlertDialogWithTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* The trigger */}
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      
      {/* The dialog */}
      <CustomAlertDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        content={content}
        cancelText={cancelText}
        confirmText={confirmText}
        onConfirm={onConfirm}
        onCancel={onCancel}
        variant={variant}
      />
    </>
  );
} 