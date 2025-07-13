#!/bin/bash

# Create directories
mkdir -p public/images/branches
mkdir -p public/images/rooms

echo "🚀 Starting image download..."

# Download branch images
echo "�� Downloading branch images..."

# Lovely branch
curl -o "public/images/branches/lovely-1.jpg" "https://localhome.vn/uploads/2025/03/z6605839395038_2bd7573b3e92ea87df4682420160d985-1.jpg"

# Tasty branch
curl -o "public/images/branches/tasty-1.jpg" "https://localhome.vn/uploads/2025/03/z6605840703070_26880629f957718e2d41fb16c5bd105d.jpg"

# Secret branch
curl -o "public/images/branches/secret-1.jpg" "https://localhome.vn/uploads/2025/03/z6419574626011_ed22af0bdeebea5acdf32b6a85a2b4a6.jpg"

echo "📸 Downloading room images..."

# Lovely room images
curl -o "public/images/rooms/lovely-room1-1.jpg" "https://localhome.vn/uploads/2025/04/z6523610677983_8b49d9fd60ac6353bed0286e3a4ded99.jpg"
curl -o "public/images/rooms/lovely-room1-2.jpg" "https://localhome.vn/uploads/2025/04/z6523610609924_8cc1ba91b5806fc85871b01844b4ac38.jpg"
curl -o "public/images/rooms/lovely-room1-3.jpg" "https://localhome.vn/uploads/2025/04/z6523610761433_12888757e6ac959025091683b9c6cbcc.jpg"

# Tasty room images
curl -o "public/images/rooms/tasty-room1-1.jpg" "https://localhome.vn/uploads/2025/04/IMG_2705-scaled.jpeg"
curl -o "public/images/rooms/tasty-room1-2.jpg" "https://localhome.vn/uploads/2025/04/IMG_2708-scaled.jpeg"
curl -o "public/images/rooms/tasty-room1-3.jpg" "https://localhome.vn/uploads/2025/04/IMG_2766-scaled.jpeg"

# Secret room images
curl -o "public/images/rooms/secret-room1-1.jpg" "https://localhome.vn/uploads/2025/04/z6523409184390_9fe875ca61a8086be1d01dcce591d23b.jpg"
curl -o "public/images/rooms/secret-room1-2.jpg" "https://localhome.vn/uploads/2025/04/z6523409177076_5669d64841f62c9829db3386e260ab74.jpg"
curl -o "public/images/rooms/secret-room1-3.jpg" "https://localhome.vn/uploads/2025/04/z6523409185616_0cd1aa2d299c280dcead0ecd0b817cfb.jpg"

echo "✅ All images downloaded!"