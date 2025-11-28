# Python API with PostgreSQL

REST API construida con FastAPI y PostgreSQL para gestionar datos de forma eficiente y profesional.

## 🚀 Características

- **FastAPI**: Framework moderno y rápido para construir APIs
- **PostgreSQL**: Base de datos relacional robusta
- **SQLAlchemy**: ORM potente para interactuar con la base de datos
- **Pydantic**: Validación automática de datos
- **Documentación Automática**: Swagger UI y ReDoc incluidos
- **CORS**: Configurado para permitir peticiones desde el frontend
- **Type Hints**: Código completamente tipado para mejor desarrollo

## 📋 Requisitos Previos

- Python 3.8 o superior
- PostgreSQL instalado y corriendo
- pgAdmin 4 (opcional, para gestión visual de la base de datos)

## 🛠️ Instalación

### 1. Crear entorno virtual

```bash
# Navegar al directorio del proyecto
cd api-python

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura tus credenciales de PostgreSQL:

```bash
copy .env.example .env
```

Edita el archivo `.env` con tus datos:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=tu_base_de_datos
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_contraseña

API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=True
```

### 4. Crear la base de datos

Abre pgAdmin 4 y crea una nueva base de datos con el nombre que especificaste en `DATABASE_NAME`.

## 🎯 Uso

### Iniciar el servidor

```bash
uvicorn app.main:app --reload
```

El servidor estará disponible en: `http://localhost:8000`

### Documentación Interactiva

Una vez iniciado el servidor, puedes acceder a:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Estas interfaces te permiten probar todos los endpoints de forma interactiva.

## 📚 Endpoints Disponibles

### Health Check
- **GET** `/api/v1/health` - Verificar estado de la API

### Usuarios (CRUD Completo)

#### Listar usuarios
```http
GET /api/v1/users?skip=0&limit=100&is_active=true
```

**Parámetros de consulta:**
- `skip`: Número de registros a saltar (paginación)
- `limit`: Máximo de registros a devolver
- `is_active`: Filtrar por estado activo (opcional)

#### Obtener usuario por ID
```http
GET /api/v1/users/{user_id}
```

#### Crear usuario
```http
POST /api/v1/users
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "is_active": true
}
```

#### Actualizar usuario
```http
PUT /api/v1/users/{user_id}
Content-Type: application/json

{
  "name": "Juan Pérez Actualizado",
  "email": "juan.nuevo@example.com"
}
```

#### Eliminar usuario
```http
DELETE /api/v1/users/{user_id}
```

## 🧪 Ejemplos de Uso

### Usando cURL

```bash
# Crear un usuario
curl -X POST "http://localhost:8000/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"María García","email":"maria@example.com","is_active":true}'

# Listar usuarios
curl "http://localhost:8000/api/v1/users"

# Obtener usuario específico
curl "http://localhost:8000/api/v1/users/1"

# Actualizar usuario
curl -X PUT "http://localhost:8000/api/v1/users/1" \
  -H "Content-Type: application/json" \
  -d '{"name":"María García López"}'

# Eliminar usuario
curl -X DELETE "http://localhost:8000/api/v1/users/1"
```

### Usando Python (requests)

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Crear usuario
response = requests.post(
    f"{BASE_URL}/users",
    json={
        "name": "Carlos Rodríguez",
        "email": "carlos@example.com",
        "is_active": True
    }
)
print(response.json())

# Listar usuarios
response = requests.get(f"{BASE_URL}/users")
print(response.json())

# Obtener usuario por ID
response = requests.get(f"{BASE_URL}/users/1")
print(response.json())

# Actualizar usuario
response = requests.put(
    f"{BASE_URL}/users/1",
    json={"name": "Carlos Rodríguez Actualizado"}
)
print(response.json())

# Eliminar usuario
response = requests.delete(f"{BASE_URL}/users/1")
print(response.json())
```

## 📁 Estructura del Proyecto

```
api-python/
├── app/
│   ├── __init__.py          # Inicialización del paquete
│   ├── main.py              # Aplicación FastAPI principal
│   ├── config.py            # Configuración y variables de entorno
│   ├── database.py          # Conexión a la base de datos
│   ├── models.py            # Modelos SQLAlchemy (tablas)
│   ├── schemas.py           # Esquemas Pydantic (validación)
│   ├── crud.py              # Operaciones CRUD
│   └── routes.py            # Definición de endpoints
├── venv/                    # Entorno virtual (no incluido en git)
├── .env                     # Variables de entorno (no incluido en git)
├── .env.example             # Plantilla de variables de entorno
├── .gitignore               # Archivos ignorados por git
├── requirements.txt         # Dependencias de Python
└── README.md                # Este archivo
```

## 🔧 Personalización

### Agregar nuevos modelos

1. Define el modelo en `app/models.py`:
```python
class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    price = Column(Numeric(10, 2))
```

2. Crea los schemas en `app/schemas.py`:
```python
class ProductCreate(BaseModel):
    name: str
    price: float
```

3. Implementa las operaciones CRUD en `app/crud.py`

4. Agrega las rutas en `app/routes.py`

## 🐛 Solución de Problemas

### Error de conexión a PostgreSQL

- Verifica que PostgreSQL esté corriendo
- Confirma las credenciales en el archivo `.env`
- Asegúrate de que la base de datos existe

### Error "Module not found"

```bash
# Reinstalar dependencias
pip install -r requirements.txt
```

### Puerto ya en uso

```bash
# Usar un puerto diferente
uvicorn app.main:app --reload --port 8001
```

## 📝 Notas Importantes

- **Seguridad**: En producción, cambia `allow_origins=["*"]` en `main.py` a tu dominio específico
- **Migraciones**: Para producción, usa Alembic para gestionar migraciones de base de datos
- **Logging**: El modo `echo=True` en `database.py` muestra todas las consultas SQL (desactívalo en producción)
- **Validación**: Todos los datos son validados automáticamente por Pydantic

## 🚀 Próximos Pasos

- [ ] Implementar autenticación JWT
- [ ] Agregar tests unitarios
- [ ] Configurar Alembic para migraciones
- [ ] Agregar más modelos según tus necesidades
- [ ] Implementar rate limiting
- [ ] Agregar logging estructurado

## 📖 Recursos

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

---

¡Tu API está lista para usar! 🎉
