import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {motion, AnimatePresence } from "motion/react";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CreateRoomModalProps {
  isActive: boolean;
  onClose: () => void; // callback to close modal
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isActive,
  onClose,
}) => {
  const router = useRouter()
  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
   const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setName("");
      setIsAdmin(false);
    }
  }, [isActive]);

  if (!isActive) return null;

  const handleCreateRoom = async () => {
    if (!name.trim() || !isAdmin) return;
    setLoading(true);
    try {
      const res = await axiosInstance.post(`/room/create`, {
        creatorName: name.trim(),
        isAdmin,
      });

      if (res.data?.roomId) {
        console.log("Room Created:", res.data);
        router.push(`/space/${res.data.roomId}`);
        onClose();
      }
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setLoading(false);
    }
  }

  const isButtonDisabled = !name.trim() || !isAdmin;

  return (
    <AnimatePresence>
      <motion.div
        initial={{
            opacity: 0
        }}
        animate = {{
            opacity: 1
        }}
        transition={{
            duration: 0.3
        }}
        exit={{
            opacity: 0
        }}
        onClick={onClose} // clicking overlay closes modal
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
      >
        <Card
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
          className="bg-white h-auto w-[90%] max-w-md p-6"
        >
          <div className="flex flex-col gap-y-3 text-black">
            <div className="mt-3 flex flex-col gap-y-2">
              <Label htmlFor="username">Enter your name</Label>
              <Input
                id="username"
                type="text"
                placeholder="Uchiha"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 !bg-transparent"
              />
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  className=""
                  checked={isAdmin}
                  onCheckedChange={(checked) => setIsAdmin(!!checked)}
                />
                <span className="text-sm font-medium">
                  <p className="text-[12px] text-neutral-700 leading-snug mt-3">
                    As an{" "}
                    <span className="font-semibold text-black">admin</span>, you
                    can{" "}
                    <span className="font-semibold">
                      admit or remove participants
                    </span>{" "}
                    and <span className="font-semibold">end the meeting</span>{" "}
                    anytime.
                  </p>
                </span>
              </div>
            </div>

            <div className="w-full mt-4 flex items-center justify-end">
              <button
                onClick={handleCreateRoom}
                disabled={isButtonDisabled}
                className={`w-fit text-white px-3 py-2 rounded-lg transition-all ${
                  isButtonDisabled
                    ? "opacity-50 bg-emerald-600 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {loading ? <Loader2 className="animate-spin"/> : "Create Room" }
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateRoomModal;
