import { useEffect, useState } from "react";
import { View } from "react-native";

import AppText from "@/src/components/AppText";
import Button from "@/src/components/Button";
import CustomModal from "@/src/components/Modal";
import { ScreenFooterShell } from "@/src/components/ScreenFooter";
import { TextField } from "@/src/components/TextField";

type EditProfileFieldModalProps = {
  visible: boolean;
  title: string;
  label: string;
  value: string;
  placeholder?: string;
  prefix?: string;
  maxLength?: number;
  onClose: () => void;
  onSave: (value: string) => void;
};

export default function EditProfileFieldModal({
  visible,
  title,
  label,
  value,
  placeholder,
  prefix,
  maxLength,
  onClose,
  onSave,
}: EditProfileFieldModalProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [value, visible]);

  const trimmedDraft = draft.trim();
  const canSave = trimmedDraft.length > 0;

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={title}
      footer={
        <ScreenFooterShell>
          <Button
            actionText="Save"
            className="h-13.5"
            disabled={!canSave}
            variant="primary"
            onPress={() => {
              onSave(trimmedDraft);
              onClose();
            }}
          />
        </ScreenFooterShell>
      }
    >
      <View className="gap-2">
        <AppText className="text-sm" weight="medium">
          {label}
        </AppText>
        <View className="flex-row items-center gap-2">
          {prefix ? (
            <AppText className="text-base" color="#828083">
              {prefix}
            </AppText>
          ) : null}
          <View className="min-w-0 flex-1">
            <TextField
              autoFocus
              className="bg-card"
              maxLength={maxLength}
              placeholder={placeholder}
              value={draft}
              onChangeText={setDraft}
            />
          </View>
        </View>
      </View>
    </CustomModal>
  );
}
