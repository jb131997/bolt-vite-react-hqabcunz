/*
  # Add metrics calculation function

  1. New Functions
    - `get_gym_metrics`: Calculates gym metrics for a given date range
      - Input parameters:
        - p_gym_id: UUID of the gym
        - p_start_date: Start date for metrics calculation
        - p_end_date: End date for metrics calculation
      - Returns metrics including:
        - Total check-ins
        - Active members
        - New members
        - Retention rate
        - Revenue metrics
        - Member changes

  2. Changes
    - Creates a new SQL function for metrics calculation
    - Handles all required metrics for both today and overview sections
    - Includes period-over-period comparison calculations
*/

CREATE OR REPLACE FUNCTION get_gym_metrics(
  p_gym_id uuid,
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
  v_period_days integer;
  v_prev_start_date timestamptz;
  v_prev_end_date timestamptz;
BEGIN
  -- Calculate period length for comparison
  v_period_days := EXTRACT(EPOCH FROM (p_end_date - p_start_date)) / 86400;
  v_prev_start_date := p_start_date - (p_end_date - p_start_date);
  v_prev_end_date := p_start_date;

  -- Calculate metrics
  WITH current_period AS (
    -- Check-ins
    SELECT
      COUNT(*) AS total_checkins,
      COUNT(DISTINCT member_id) AS unique_checkins
    FROM member_activities
    WHERE type = 'Check-in'
      AND created_at BETWEEN p_start_date AND p_end_date
      AND member_id IN (SELECT id FROM members WHERE gym_id = p_gym_id)
  ),
  previous_period AS (
    -- Previous period check-ins
    SELECT
      COUNT(*) AS total_checkins,
      COUNT(DISTINCT member_id) AS unique_checkins
    FROM member_activities
    WHERE type = 'Check-in'
      AND created_at BETWEEN v_prev_start_date AND v_prev_end_date
      AND member_id IN (SELECT id FROM members WHERE gym_id = p_gym_id)
  ),
  member_stats AS (
    -- Member statistics
    SELECT
      COUNT(*) AS total_members,
      COUNT(*) FILTER (WHERE status = 'active') AS active_members,
      COUNT(*) FILTER (WHERE created_at BETWEEN p_start_date AND p_end_date) AS new_members,
      COUNT(*) FILTER (WHERE created_at BETWEEN v_prev_start_date AND v_prev_end_date) AS prev_new_members
    FROM members
    WHERE gym_id = p_gym_id
  ),
  revenue_stats AS (
    -- Revenue calculations
    SELECT
      COALESCE(SUM(amount), 0) AS total_revenue,
      COUNT(DISTINCT customer_id) AS paying_members
    FROM payments
    WHERE gym_id = p_gym_id
      AND created_at BETWEEN p_start_date AND p_end_date
      AND status = 'succeeded'
  ),
  prev_revenue_stats AS (
    -- Previous period revenue
    SELECT
      COALESCE(SUM(amount), 0) AS total_revenue,
      COUNT(DISTINCT customer_id) AS paying_members
    FROM payments
    WHERE gym_id = p_gym_id
      AND created_at BETWEEN v_prev_start_date AND v_prev_end_date
      AND status = 'succeeded'
  )
  SELECT json_build_object(
    'total_checkins', cp.total_checkins,
    'unique_checkins', cp.unique_checkins,
    'checkins_change', CASE 
      WHEN pp.total_checkins = 0 THEN 100
      ELSE ROUND(((cp.total_checkins - pp.total_checkins)::numeric / pp.total_checkins * 100)::numeric, 1)
    END,
    'active_members', ms.active_members,
    'active_members_change', CASE 
      WHEN ms.active_members = 0 THEN 0
      ELSE ROUND(((ms.active_members - ms.total_members)::numeric / ms.total_members * 100)::numeric, 1)
    END,
    'new_members', ms.new_members,
    'new_members_change', CASE 
      WHEN ms.prev_new_members = 0 THEN 100
      ELSE ROUND(((ms.new_members - ms.prev_new_members)::numeric / ms.prev_new_members * 100)::numeric, 1)
    END,
    'retention_rate', ROUND((cp.unique_checkins::numeric / ms.active_members * 100)::numeric, 1),
    'revenue_per_member', CASE 
      WHEN rs.paying_members = 0 THEN 0
      ELSE ROUND((rs.total_revenue / rs.paying_members)::numeric, 2)
    END,
    'revenue_change', CASE 
      WHEN prs.total_revenue = 0 THEN 100
      ELSE ROUND(((rs.total_revenue - prs.total_revenue)::numeric / prs.total_revenue * 100)::numeric, 1)
    END
  ) INTO v_result
  FROM current_period cp
  CROSS JOIN previous_period pp
  CROSS JOIN member_stats ms
  CROSS JOIN revenue_stats rs
  CROSS JOIN prev_revenue_stats prs;

  RETURN v_result;
END;
$$;