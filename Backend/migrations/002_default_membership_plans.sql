-- Insert default membership plans if they don't exist
-- These plans are referenced by the registration flow

-- 1. ANNUAL Plan (for working and retired members)
INSERT INTO membership_plans (plan_code, name_en, name_ar, duration_months, price, is_renewable, plan_type, description_en, description_ar)
VALUES 
('ANNUAL', 'Annual Membership', 'عضوية سنوية', 12, 500.00, true, 'REGULAR', 'Standard annual membership plan', 'خطة العضوية السنوية القياسية')
ON CONFLICT (plan_code) DO NOTHING;

-- 2. STUDENT Plan
INSERT INTO membership_plans (plan_code, name_en, name_ar, duration_months, price, is_renewable, plan_type, description_en, description_ar)
VALUES 
('STUDENT', 'Student Membership', 'عضوية طلاب', 12, 200.00, true, 'STUDENT', 'Discounted membership for university students', 'عضوية مخفضة لطلاب الجامعة')
ON CONFLICT (plan_code) DO NOTHING;

-- 3. DEPENDENT Plan
INSERT INTO membership_plans (plan_code, name_en, name_ar, duration_months, price, is_renewable, plan_type, description_en, description_ar)
VALUES 
('DEPENDENT', 'Dependent Membership', 'عضوية تابعة', 12, 300.00, true, 'DEPENDENT', 'Membership for family members of existing members', 'عضوية لأفراد عائلة الأعضاء الحاليين')
ON CONFLICT (plan_code) DO NOTHING;

-- 4. SEASONAL Plan (for foreigners)
INSERT INTO membership_plans (plan_code, name_en, name_ar, duration_months, price, is_renewable, plan_type, description_en, description_ar)
VALUES 
('SEASONAL', 'Seasonal Membership', 'عضوية موسمية', 3, 400.00, true, 'SEASONAL', 'Short-term membership for foreigners', 'عضوية قصيرة المدى للأجانب')
ON CONFLICT (plan_code) DO NOTHING;

-- 5. FULL_ACCESS Plan (fallback default)
INSERT INTO membership_plans (plan_code, name_en, name_ar, duration_months, price, is_renewable, plan_type, description_en, description_ar)
VALUES 
('FULL_ACCESS', 'Full Access Membership', 'عضوية كاملة', 12, 500.00, true, 'REGULAR', 'Full access membership plan', 'خطة عضوية بصلاحيات كاملة')
ON CONFLICT (plan_code) DO NOTHING;
