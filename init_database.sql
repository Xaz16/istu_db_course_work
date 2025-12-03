DROP TABLE IF EXISTS product_components CASCADE;
DROP TABLE IF EXISTS production_process CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS components CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS operations_catalog CASCADE;

CREATE TABLE operations_catalog (
    operation_id INTEGER PRIMARY KEY,
    operation_name VARCHAR(100) NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL CHECK (hourly_rate > 0),
    hours_required DECIMAL(5,2) NOT NULL DEFAULT 1.0 CHECK (hours_required > 0),
    created_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE materials (
    material_id INTEGER PRIMARY KEY,
    material_name VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    unit_of_measure VARCHAR(20) DEFAULT 'pcs',
    stock_quantity DECIMAL(10,2) DEFAULT 0 CHECK (stock_quantity >= 0)
);

CREATE TABLE components (
    component_id INTEGER PRIMARY KEY,
    component_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    process_number INTEGER NOT NULL,
    created_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE products (
    product_id INTEGER PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    furniture_type VARCHAR(50) DEFAULT 'general',
    created_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE product_components (
    product_id INTEGER,
    component_id INTEGER,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    PRIMARY KEY (product_id, component_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (component_id) REFERENCES components(component_id) ON DELETE CASCADE
);

CREATE TABLE production_process (
    component_id INTEGER,
    material_id INTEGER,
    material_quantity DECIMAL(8,2) NOT NULL CHECK (material_quantity > 0),
    operation_id INTEGER NOT NULL,
    PRIMARY KEY (component_id, material_id, operation_id),
    FOREIGN KEY (component_id) REFERENCES components(component_id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(material_id) ON DELETE CASCADE,
    FOREIGN KEY (operation_id) REFERENCES operations_catalog(operation_id) ON DELETE CASCADE
);

CREATE INDEX idx_products_type ON products(furniture_type);
CREATE INDEX idx_materials_price ON materials(price);
CREATE INDEX idx_components_price ON components(price);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_production_process_operation ON production_process(operation_id);

CREATE VIEW expensive_products AS
SELECT 
    product_id,
    product_name,
    price,
    furniture_type,
    created_date
FROM products;

CREATE VIEW full_component_info AS
SELECT 
    c.component_id,
    c.component_name,
    c.price,
    c.process_number,
    COUNT(pc.product_id) as product_count
FROM components c
LEFT JOIN product_components pc ON c.component_id = pc.component_id
GROUP BY c.component_id, c.component_name, c.price, c.process_number;

CREATE VIEW product_costs AS
SELECT 
    p.product_id,
    p.product_name,
    COALESCE(SUM(pc.quantity * c.price), 0) as component_cost,
    0 as material_cost,
    0 as operation_cost,
    COALESCE(SUM(pc.quantity * c.price), 0) as total_cost
FROM products p
LEFT JOIN product_components pc ON p.product_id = pc.product_id
LEFT JOIN components c ON pc.component_id = c.component_id
GROUP BY p.product_id, p.product_name;

CREATE VIEW full_production_process AS
SELECT 
    p.product_id,
    p.product_name as product,
    c.component_id,
    c.component_name as component,
    m.material_id,
    m.material_name as material,
    pp.material_quantity,
    oc.operation_id,
    oc.operation_name,
    oc.hourly_rate,
    oc.hours_required
FROM products p
JOIN product_components pc ON p.product_id = pc.product_id
JOIN components c ON pc.component_id = c.component_id
JOIN production_process pp ON c.component_id = pp.component_id
JOIN materials m ON pp.material_id = m.material_id
JOIN operations_catalog oc ON pp.operation_id = oc.operation_id
ORDER BY p.product_id, c.component_id, oc.operation_id;

CREATE OR REPLACE FUNCTION update_material_stock()
RETURNS TRIGGER AS $$
DECLARE
    quantity_diff DECIMAL(8,2);
    new_stock DECIMAL(8,2);
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE materials 
        SET stock_quantity = stock_quantity - NEW.material_quantity
        WHERE material_id = NEW.material_id;
        
        SELECT stock_quantity INTO new_stock 
        FROM materials 
        WHERE material_id = NEW.material_id;
        
        IF new_stock < 0 THEN
            RAISE EXCEPTION 'Insufficient material in stock! Material ID: %, Available: %, Required: %', 
                NEW.material_id, new_stock + NEW.material_quantity, NEW.material_quantity;
        END IF;
        
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        quantity_diff := NEW.material_quantity - OLD.material_quantity;
        
        IF NEW.material_id != OLD.material_id THEN
            UPDATE materials 
            SET stock_quantity = stock_quantity + OLD.material_quantity
            WHERE material_id = OLD.material_id;
            
            UPDATE materials 
            SET stock_quantity = stock_quantity - NEW.material_quantity
            WHERE material_id = NEW.material_id;
            
            SELECT stock_quantity INTO new_stock 
            FROM materials 
            WHERE material_id = NEW.material_id;
        ELSE
            UPDATE materials 
            SET stock_quantity = stock_quantity - quantity_diff
            WHERE material_id = NEW.material_id;
            
            SELECT stock_quantity INTO new_stock 
            FROM materials 
            WHERE material_id = NEW.material_id;
        END IF;
        
        IF new_stock < 0 THEN
            RAISE EXCEPTION 'Insufficient material in stock! Material ID: %, Available: %, Required: %', 
                NEW.material_id, new_stock + NEW.material_quantity, NEW.material_quantity;
        END IF;
        
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE materials 
        SET stock_quantity = stock_quantity + OLD.material_quantity
        WHERE material_id = OLD.material_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_material_stock
    AFTER INSERT OR UPDATE OR DELETE ON production_process
    FOR EACH ROW
    EXECUTE FUNCTION update_material_stock();

INSERT INTO operations_catalog VALUES 
(1, 'Распиловка', 450.00, 0.5),
(2, 'Шлифовка', 380.00, 0.3),
(3, 'Сборка', 520.00, 1.0),
(4, 'Покраска', 480.00, 0.5);

INSERT INTO materials VALUES 
(1, 'Доска дубовая', 1200.00, 'м²', 100),
(2, 'Доска сосновая', 350.00, 'м²', 150),
(3, 'Фанера', 500.00, 'м²', 80),
(4, 'Крепеж', 120.00, 'кг', 200),
(5, 'Лак', 300.00, 'л', 50);

INSERT INTO components VALUES 
(1, 'Сидушка табуретки', 400.00, 1),
(2, 'Ножка табуретки', 200.00, 2),
(3, 'Столешница', 2000.00, 3),
(4, 'Ножки стола', 600.00, 4),
(5, 'Ящик', 800.00, 5),
(6, 'Спинка стула', 600.00, 6),
(7, 'Сидушка стула', 500.00, 7),
(8, 'Подлокотники', 400.00, 8),
(9, 'Дверца шкафа', 1000.00, 9),
(10, 'Полка шкафа', 500.00, 10),
(11, 'Каркас шкафа', 1800.00, 11),
(12, 'Задняя стенка', 350.00, 12),
(13, 'Крышка комода', 1400.00, 13),
(14, 'Боковины', 1100.00, 14),
(15, 'Изголовье кровати', 1500.00, 15),
(16, 'Основание кровати', 1300.00, 16),
(17, 'Спинка дивана', 1100.00, 17),
(18, 'Подлокотники дивана', 800.00, 18),
(19, 'Сиденье дивана', 900.00, 19),
(20, 'Полка тумбы', 350.00, 20),
(21, 'Дверца тумбы', 900.00, 21),
(22, 'Корпус тумбы', 1000.00, 22),
(23, 'Верхняя полка гарнитура', 750.00, 23),
(24, 'Нижняя полка гарнитура', 650.00, 24),
(25, 'Дверца гарнитура', 1100.00, 25),
(26, 'Полка стеллажа', 450.00, 26),
(27, 'Боковая стойка стеллажа', 550.00, 27),
(28, 'Задняя панель стеллажа', 300.00, 28);

INSERT INTO products VALUES 
(1, 'Табуретка', 1560.00, 'мебель для сидения'),
(2, 'Письменный стол', 8840.00, 'офисная мебель'),
(3, 'Офисный стул', 5590.00, 'офисная мебель'),
(4, 'Шкаф-купе', 10595.00, 'корпусная мебель'),
(5, 'Комод', 12220.00, 'корпусная мебель'),
(6, 'Кровать двуспальная', 6500.00, 'спальная мебель'),
(7, 'Диван угловой', 5720.00, 'мягкая мебель'),
(8, 'Тумба под ТВ', 4940.00, 'корпусная мебель'),
(9, 'Кухонный гарнитур', 14040.00, 'кухонная мебель'),
(10, 'Стеллаж', 4745.00, 'корпусная мебель');

INSERT INTO product_components VALUES 
(1, 1, 1),
(1, 2, 4),
(2, 3, 1),
(2, 4, 4),
(2, 5, 3),
(3, 4, 4),
(3, 6, 1),
(3, 7, 1),
(3, 8, 2),
(4, 9, 3),
(4, 10, 6),
(4, 11, 1),
(4, 12, 1),
(5, 5, 6),
(5, 10, 2),
(5, 13, 1),
(5, 14, 2),
(6, 14, 2),
(6, 15, 1),
(6, 16, 1),
(7, 8, 2),
(7, 17, 1),
(7, 18, 2),
(7, 19, 1),
(8, 10, 2),
(8, 21, 2),
(8, 22, 1),
(9, 23, 3),
(9, 24, 3),
(9, 25, 6),
(10, 26, 5),
(10, 27, 2),
(10, 28, 1);

INSERT INTO production_process VALUES 
(1, 2, 0.3, 1), (1, 4, 0.05, 3), (1, 5, 0.05, 4),
(2, 2, 0.2, 1), (2, 4, 0.03, 3), (2, 5, 0.03, 4),
(3, 1, 0.8, 1), (3, 4, 0.2, 3), (3, 5, 0.1, 4),
(4, 2, 0.3, 1), (4, 4, 0.15, 3), (4, 5, 0.08, 4),
(5, 3, 0.5, 1), (5, 4, 0.2, 3), (5, 5, 0.1, 4),
(6, 2, 0.25, 1), (6, 4, 0.1, 3), (6, 5, 0.08, 4),
(7, 3, 0.2, 1), (7, 4, 0.12, 3), (7, 5, 0.06, 4),
(8, 2, 0.2, 1), (8, 4, 0.08, 3), (8, 5, 0.05, 4),
(9, 3, 0.6, 1), (9, 4, 0.15, 3), (9, 5, 0.1, 4),
(10, 3, 0.4, 1), (10, 4, 0.12, 3), (10, 5, 0.08, 4),
(11, 3, 1.0, 1), (11, 4, 0.3, 3), (11, 5, 0.15, 4),
(12, 3, 0.5, 1), (12, 4, 0.1, 3), (12, 5, 0.05, 4),
(13, 1, 0.7, 1), (13, 4, 0.18, 3), (13, 5, 0.12, 4),
(14, 2, 0.5, 1), (14, 4, 0.2, 3), (14, 5, 0.1, 4),
(15, 1, 0.6, 1), (15, 4, 0.15, 3), (15, 5, 0.1, 4),
(16, 2, 0.8, 1), (16, 4, 0.25, 3), (16, 5, 0.15, 4),
(17, 2, 0.4, 1), (17, 4, 0.15, 3), (17, 5, 0.1, 4),
(18, 2, 0.3, 1), (18, 4, 0.12, 3), (18, 5, 0.08, 4),
(19, 3, 0.35, 1), (19, 4, 0.14, 3), (19, 5, 0.09, 4),
(20, 3, 0.25, 1), (20, 4, 0.08, 3), (20, 5, 0.04, 4),
(21, 3, 0.45, 1), (21, 4, 0.13, 3), (21, 5, 0.08, 4),
(22, 3, 0.5, 1), (22, 4, 0.15, 3), (22, 5, 0.1, 4),
(23, 3, 0.4, 1), (23, 4, 0.12, 3), (23, 5, 0.08, 4),
(24, 3, 0.35, 1), (24, 4, 0.1, 3), (24, 5, 0.06, 4),
(25, 3, 0.55, 1), (25, 4, 0.16, 3), (25, 5, 0.1, 4),
(26, 3, 0.3, 1), (26, 4, 0.1, 3), (26, 5, 0.06, 4),
(27, 2, 0.35, 1), (27, 4, 0.12, 3), (27, 5, 0.07, 4),
(28, 3, 0.4, 1), (28, 4, 0.1, 3), (28, 5, 0.05, 4);

CREATE VIEW sales_profit AS
SELECT 
    p.product_id,
    p.product_name,
    p.price as selling_price,
    pc.total_cost,
    (p.price - pc.total_cost) as profit,
    ROUND(((p.price - pc.total_cost) / pc.total_cost * 100), 2) as profitability_percent
FROM products p
JOIN product_costs pc ON p.product_id = pc.product_id
WHERE pc.total_cost > 0;