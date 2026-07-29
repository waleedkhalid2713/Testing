export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      email_verification_codes: {
        Row: { attempts: number; code_hash: string; consumed_at: string | null; created_at: string; email: string; expires_at: string; id: string; purpose: string }
        Insert: { attempts?: number; code_hash: string; consumed_at?: string | null; created_at?: string; email: string; expires_at?: string; id?: string; purpose?: string }
        Update: { attempts?: number; code_hash?: string; consumed_at?: string | null; created_at?: string; email?: string; expires_at?: string; id?: string; purpose?: string }
        Relationships: []
      }
      contact_messages: {
        Row: { category: string; created_at: string; email: string; id: string; message: string; name: string; status: string; subject: string }
        Insert: { category: string; created_at?: string; email: string; id?: string; message: string; name: string; status?: string; subject: string }
        Update: { category?: string; created_at?: string; email?: string; id?: string; message?: string; name?: string; status?: string; subject?: string }
        Relationships: []
      }
      bootcamp_content: {
        Row: { content: Json; created_at: string; id: string; updated_at: string }
        Insert: { content?: Json; created_at?: string; id?: string; updated_at?: string }
        Update: { content?: Json; created_at?: string; id?: string; updated_at?: string }
        Relationships: []
      }
      profiles: {
        Row: { email: string; forecast_disclaimer_accepted_at: string | null; id: string; incorporated_at: string; region: string }
        Insert: { email: string; forecast_disclaimer_accepted_at?: string | null; id: string; incorporated_at?: string; region?: string }
        Update: { email?: string; forecast_disclaimer_accepted_at?: string | null; id?: string; incorporated_at?: string; region?: string }
        Relationships: []
      }
      trading_instruments: {
        Row: { created_at: string; display_order: number; id: string; is_active: boolean; market: string; market_type: string; name: string; sub_market: string; symbol: string }
        Insert: { created_at?: string; display_order?: number; id?: string; is_active?: boolean; market: string; market_type?: string; name?: string; sub_market?: string; symbol: string }
        Update: { created_at?: string; display_order?: number; id?: string; is_active?: boolean; market?: string; market_type?: string; name?: string; sub_market?: string; symbol?: string }
        Relationships: []
      }
      trading_forecasts: {
        Row: { ai_extraction: Json | null; chart_metadata: Json | null; created_at: string; direction: string; exchange: string; execution_price: number; expected_pnl: number | null; id: string; image_path: string | null; instrument_id: string; notes: string; published_at: string; rationale: string; result_image_path: string | null; result_notes: string; result_pnl: number | null; result_pnl_percent: number | null; source_type: string; status: string; stop_loss: number; take_profit_1: number; take_profit_2: number | null; take_profit_3: number | null; timeframe: string; trade_date: string; tradingview_symbol: string | null; updated_at: string }
        Insert: { ai_extraction?: Json | null; chart_metadata?: Json | null; created_at?: string; direction: string; exchange?: string; execution_price: number; expected_pnl?: number | null; id?: string; image_path?: string | null; instrument_id: string; notes?: string; published_at?: string; rationale?: string; result_image_path?: string | null; result_notes?: string; result_pnl?: number | null; result_pnl_percent?: number | null; source_type?: string; status?: string; stop_loss: number; take_profit_1: number; take_profit_2?: number | null; take_profit_3?: number | null; timeframe?: string; trade_date?: string; tradingview_symbol?: string | null; updated_at?: string }
        Update: { ai_extraction?: Json | null; chart_metadata?: Json | null; created_at?: string; direction?: string; exchange?: string; execution_price?: number; expected_pnl?: number | null; id?: string; image_path?: string | null; instrument_id?: string; notes?: string; published_at?: string; rationale?: string; result_image_path?: string | null; result_notes?: string; result_pnl?: number | null; result_pnl_percent?: number | null; source_type?: string; status?: string; stop_loss?: number; take_profit_1?: number; take_profit_2?: number | null; take_profit_3?: number | null; timeframe?: string; trade_date?: string; tradingview_symbol?: string | null; updated_at?: string }
        Relationships: []
      }
      user_activity_events: {
        Row: { id: string; page: string; region: string; user_id: string; visited_at: string }
        Insert: { id?: string; page: string; region?: string; user_id: string; visited_at?: string }
        Update: { id?: string; page?: string; region?: string; user_id?: string; visited_at?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { accept_forecast_disclaimer: { Args: Record<PropertyKey, never>; Returns: string }; has_accepted_forecast_disclaimer: { Args: Record<PropertyKey, never>; Returns: boolean } }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer Row } ? Row : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer Row } ? Row : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer Insert } ? Insert : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer Insert } ? Insert : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer Update } ? Update : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer Update } ? Update : never
    : never

export const Constants = { public: { Enums: {} } } as const
