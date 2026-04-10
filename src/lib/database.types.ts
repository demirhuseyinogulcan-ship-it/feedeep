// ─────────────────────────────────────────────────────────────
// feedeep — Supabase Database Types
// Supabase tablolarının TypeScript tip tanımları.
// Tablo eklendikçe burası güncellenir.
// ─────────────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          created_at?: string;
        };
        Update: {
          username?: string;
        };
      };
      signals: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          owned: boolean;
          vote: "upvote" | "downvote" | null;
          owned_at: string | null;
          voted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id: string;
          owned?: boolean;
          vote?: "upvote" | "downvote" | null;
          owned_at?: string | null;
          voted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          owned?: boolean;
          vote?: "upvote" | "downvote" | null;
          owned_at?: string | null;
          voted_at?: string | null;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          parent_id: string | null;
          text: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id: string;
          parent_id?: string | null;
          text: string;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          text?: string;
          image_url?: string | null;
        };
      };
      comment_votes: {
        Row: {
          id: string;
          user_id: string;
          comment_id: string;
          vote: "up" | "down";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          comment_id: string;
          vote: "up" | "down";
          created_at?: string;
        };
        Update: {
          vote?: "up" | "down";
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          p256dh?: string;
          auth?: string;
          user_agent?: string | null;
        };
      };
    };
    Functions: {
      get_article_stats: {
        Args: { p_article_id: string };
        Returns: {
          total_owners: number;
          total_upvotes: number;
          total_downvotes: number;
          total_comments: number;
        }[];
      };
      get_batch_article_stats: {
        Args: { article_ids: string[] };
        Returns: {
          article_id: string;
          total_owners: number;
          total_upvotes: number;
          total_downvotes: number;
          total_comments: number;
        }[];
      };
    };
  };
};
