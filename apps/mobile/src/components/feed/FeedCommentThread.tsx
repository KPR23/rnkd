import { View } from "react-native";

import FeedCommentRow, {
  type FeedCommentData,
  type FeedMenuAnchor,
} from "./FeedCommentRow";

type Props = {
  comments: FeedCommentData[];
  repliesByParent: Map<string, FeedCommentData[]>;
  currentUserId?: string;
  pendingLikeCommentId: string | null;
  depth?: number;
  onToggleLike: (commentId: string) => void;
  onReply: (comment: FeedCommentData) => void;
  onMenuPress: (comment: FeedCommentData, anchor: FeedMenuAnchor) => void;
};

function FeedCommentBranch({
  comment,
  repliesByParent,
  currentUserId,
  pendingLikeCommentId,
  depth = 0,
  onToggleLike,
  onReply,
  onMenuPress,
}: {
  comment: FeedCommentData;
  repliesByParent: Map<string, FeedCommentData[]>;
  currentUserId?: string;
  pendingLikeCommentId: string | null;
  depth?: number;
  onToggleLike: (commentId: string) => void;
  onReply: (comment: FeedCommentData) => void;
  onMenuPress: (comment: FeedCommentData, anchor: FeedMenuAnchor) => void;
}) {
  const replies = repliesByParent.get(comment.id) ?? [];

  return (
    <View className="gap-5">
      <FeedCommentRow
        comment={comment}
        depth={depth}
        isLikePending={pendingLikeCommentId === comment.id}
        showMenu={comment.author.id === currentUserId}
        onToggleLike={() => onToggleLike(comment.id)}
        onReply={() => onReply(comment)}
        onMenuPress={(anchor) => onMenuPress(comment, anchor)}
      />
      {replies.length ? (
        <View className="gap-5">
          {replies.map((reply) => (
            <FeedCommentBranch
              key={reply.id}
              comment={reply}
              repliesByParent={repliesByParent}
              currentUserId={currentUserId}
              pendingLikeCommentId={pendingLikeCommentId}
              depth={depth + 1}
              onToggleLike={onToggleLike}
              onReply={onReply}
              onMenuPress={onMenuPress}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function FeedCommentThread({
  comments,
  repliesByParent,
  currentUserId,
  pendingLikeCommentId,
  onToggleLike,
  onReply,
  onMenuPress,
}: Props) {
  return (
    <View className="gap-5">
      {comments.map((comment) => (
        <FeedCommentBranch
          key={comment.id}
          comment={comment}
          repliesByParent={repliesByParent}
          currentUserId={currentUserId}
          pendingLikeCommentId={pendingLikeCommentId}
          onToggleLike={onToggleLike}
          onReply={onReply}
          onMenuPress={onMenuPress}
        />
      ))}
    </View>
  );
}
