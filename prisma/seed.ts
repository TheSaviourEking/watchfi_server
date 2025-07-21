import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Clear existing data (optional, comment out if not needed)
    await prisma.$transaction([
        prisma.watchPhoto.deleteMany(),
        prisma.watchSpecificationPoint.deleteMany(),
        prisma.watchSpecificationHeading.deleteMany(),
        prisma.watchMaterial.deleteMany(),
        prisma.watchConcept.deleteMany(),
        prisma.watchCategory.deleteMany(),
        prisma.watchColor.deleteMany(),
        prisma.bookingWatch.deleteMany(),
        prisma.cryptoPayment.deleteMany(), // Updated to clear CryptoPayment
        prisma.booking.deleteMany(),
        prisma.watch.deleteMany(),
        prisma.brand.deleteMany(),
        prisma.color.deleteMany(),
        prisma.category.deleteMany(),
        prisma.concept.deleteMany(),
        prisma.material.deleteMany(),
        prisma.customer.deleteMany(),
    ]);

    // Create Brands
    await prisma.brand.createMany({
        data: [
            { name: 'Rolex', logoUrl: 'https://www.rolex.com/content/dam/rolex-ui/logo/rolex_logo_green_black.svg' },
            { name: 'Omega', logoUrl: 'https://www.omegawatches.com/media/logo.svg' },
            { name: 'Seiko', logoUrl: 'https://www.seikowatches.com/au-en/-/media/Seiko/Global/Logo/seiko_logo.svg' },
            { name: 'Patek Philippe', logoUrl: 'https://www.patek.com/images/logo.png' },
        ],
    });

    // Fetch created brands
    const rolex = await prisma.brand.findFirst({ where: { name: 'Rolex' } });
    const omega = await prisma.brand.findFirst({ where: { name: 'Omega' } });
    const seiko = await prisma.brand.findFirst({ where: { name: 'Seiko' } });
    const patek = await prisma.brand.findFirst({ where: { name: 'Patek Philippe' } });

    // Create Colors
    await prisma.color.createMany({
        data: [
            { name: 'Black', hex: '#000000' },
            { name: 'Silver', hex: '#C0C0C0' },
            { name: 'Blue', hex: '#0000FF' },
            { name: 'Green', hex: '#008000' },
            { name: 'Gold', hex: '#FFD700' },
        ],
    });

    // Create Categories
    await prisma.category.createMany({
        data: [
            { name: 'Dive Watch' },
            { name: 'Chronograph' },
            { name: 'Dress Watch' },
            { name: 'Pilot Watch' },
        ],
    });

    // Create Concepts
    await prisma.concept.createMany({
        data: [
            { name: 'Luxury' },
            { name: 'Sport' },
            { name: 'Vintage' },
            { name: 'Modern' },
        ],
    });

    // Create Materials
    await prisma.material.createMany({
        data: [
            { name: 'Stainless Steel' },
            { name: 'Ceramic' },
            { name: 'Gold' },
            { name: 'Titanium' },
        ],
    });

    // Create Watches (20 watches)
    await prisma.watch.createMany({
        data: [
            {
                name: 'Rolex Submariner Date',
                price: 9500.00,
                referenceCode: '126610LN',
                description: 'Iconic dive watch with a black dial and ceramic bezel.',
                primaryPhotoUrl: 'https://content.rolex.com/v7/dam/watches/family-pages/submariner/family_submariner_41mm_m126610ln_0002_v1_3000px.jpg',
                brandId: rolex!.id,
                stockQuantity: 10,
                isAvailable: true,
            },
            {
                name: 'Rolex Daytona',
                price: 14000.00,
                referenceCode: '116500LN',
                description: 'Legendary chronograph with a black ceramic bezel.',
                primaryPhotoUrl: 'https://content.rolex.com/v7/dam/watches/family-pages/daytona/family_daytona_m116500ln_0001_v1_3000px.jpg',
                brandId: rolex!.id,
                stockQuantity: 5,
                isAvailable: true,
            },
            {
                name: 'Omega Seamaster Diver 300M',
                price: 5600.00,
                referenceCode: '210.30.42.20.01.001',
                description: 'Professional dive watch with a black dial.',
                primaryPhotoUrl: 'https://www.omegawatches.com/media/omega/product/seamaster/diver-300m-co-axial-master-chronometer-42-mm/21030422001001/21030422001001-a1.png',
                brandId: omega!.id,
                stockQuantity: 15,
                isAvailable: true,
            },
            {
                name: 'Omega Speedmaster Professional',
                price: 6500.00,
                referenceCode: '310.30.42.50.01.002',
                description: 'Moonwatch with a hesalite crystal.',
                primaryPhotoUrl: 'https://www.omegawatches.com/media/omega/product/speedmaster/moonwatch-professional/31030425001002/31030425001002-a1.png',
                brandId: omega!.id,
                stockQuantity: 8,
                isAvailable: true,
            },
            {
                name: 'Seiko Prospex Turtle',
                price: 450.00,
                referenceCode: 'SRP777',
                description: 'Affordable dive watch with a black dial.',
                primaryPhotoUrl: 'https://www.seikowatches.com/au-en/-/media/Seiko/Product/Prospex/SRP777K1/SRP777K1_1.png',
                brandId: seiko!.id,
                stockQuantity: 20,
                isAvailable: true,
            },
            {
                name: 'Seiko Presage Cocktail Time',
                price: 550.00,
                referenceCode: 'SRPB43',
                description: 'Elegant dress watch with a blue dial.',
                primaryPhotoUrl: 'https://www.seikowatches.com/au-en/-/media/Seiko/Product/Presage/SRPB43J1/SRPB43J1_1.png',
                brandId: seiko!.id,
                stockQuantity: 12,
                isAvailable: true,
            },
            {
                name: 'Rolex Datejust 36',
                price: 7200.00,
                referenceCode: '126234',
                description: 'Classic dress watch with a white gold fluted bezel.',
                primaryPhotoUrl: 'https://content.rolex.com/v7/dam/watches/family-pages/datejust/family_datejust_36mm_m126234_0010_v1_3000px.jpg',
                brandId: rolex!.id,
                stockQuantity: 7,
                isAvailable: true,
            },
            {
                name: 'Omega Constellation',
                price: 7800.00,
                referenceCode: '131.33.41.21.06.001',
                description: 'Luxury watch with a grey dial.',
                primaryPhotoUrl: 'https://www.omegawatches.com/media/omega/product/constellation/co-axial-master-chronometer-41-mm/13133412106001/13133412106001-a1.png',
                brandId: omega!.id,
                stockQuantity: 6,
                isAvailable: true,
            },
            {
                name: 'Seiko Astron GPS Solar',
                price: 2200.00,
                referenceCode: 'SSH019',
                description: 'High-tech solar-powered watch with GPS.',
                primaryPhotoUrl: 'https://www.seikowatches.com/au-en/-/media/Seiko/Product/Astron/SSH019J1/SSH019J1_1.png',
                brandId: seiko!.id,
                stockQuantity: 10,
                isAvailable: true,
            },
            {
                name: 'Rolex Explorer II',
                price: 8500.00,
                referenceCode: '226570',
                description: 'Adventure watch with a 24-hour bezel.',
                primaryPhotoUrl: 'https://content.rolex.com/v7/dam/watches/family-pages/explorer/family_explorer_ii_m226570_0002_v1_3000px.jpg',
                brandId: rolex!.id,
                stockQuantity: 4,
                isAvailable: true,
            },
            {
                name: 'Patek Philippe Nautilus',
                price: 34000.00,
                referenceCode: '5711/1A-010',
                description: 'Luxury sports watch with a blue dial.',
                primaryPhotoUrl: 'https://www.patek.com/images/watches/5711_1A_010.png',
                brandId: patek!.id,
                stockQuantity: 3,
                isAvailable: true,
            },
            {
                name: 'Rolex GMT-Master II',
                price: 9500.00,
                referenceCode: '126710BLRO',
                description: 'GMT watch with a Pepsi bezel.',
                primaryPhotoUrl: 'https://content.rolex.com/v7/dam/watches/family-pages/gmt-master-ii/family_gmt_master_ii_m126710blro_0001_v1_3000px.jpg',
                brandId: rolex!.id,
                stockQuantity: 6,
                isAvailable: true,
            },
            {
                name: 'Omega Aqua Terra',
                price: 6000.00,
                referenceCode: '220.10.41.21.03.001',
                description: 'Versatile watch with a blue dial.',
                primaryPhotoUrl: 'https://www.omegawatches.com/media/omega/product/seamaster/aqua-terra-150m/22010412103001/22010412103001-a1.png',
                brandId: omega!.id,
                stockQuantity: 9,
                isAvailable: true,
            },
            {
                name: 'Seiko Prospex Alpinist',
                price: 750.00,
                referenceCode: 'SPB121',
                description: 'Field watch with a green dial.',
                primaryPhotoUrl: 'https://www.seikowatches.com/au-en/-/media/Seiko/Product/Prospex/SPB121J1/SPB121J1_1.png',
                brandId: seiko!.id,
                stockQuantity: 15,
                isAvailable: true,
            },
            {
                name: 'Patek Philippe Calatrava',
                price: 29000.00,
                referenceCode: '5196G-001',
                description: 'Classic dress watch with a white gold case.',
                primaryPhotoUrl: 'https://www.patek.com/images/watches/5196G_001.png',
                brandId: patek!.id,
                stockQuantity: 4,
                isAvailable: true,
            },
            {
                name: 'Rolex Yacht-Master 40',
                price: 12000.00,
                referenceCode: '126622',
                description: 'Luxury sports watch with a rhodium dial.',
                primaryPhotoUrl: 'https://content.rolex.com/v7/dam/watches/family-pages/yacht-master/family_yacht_master_m126622_0001_v1_3000px.jpg',
                brandId: rolex!.id,
                stockQuantity: 5,
                isAvailable: true,
            },
            {
                name: 'Omega Globemaster',
                price: 8200.00,
                referenceCode: '130.33.41.22.06.001',
                description: 'Elegant watch with a grey dial.',
                primaryPhotoUrl: 'https://www.omegawatches.com/media/omega/product/constellation/globemaster/13033412206001/13033412206001-a1.png',
                brandId: omega!.id,
                stockQuantity: 7,
                isAvailable: true,
            },
            {
                name: 'Seiko Prospex Monster',
                price: 500.00,
                referenceCode: 'SRP581',
                description: 'Rugged dive watch with a black dial.',
                primaryPhotoUrl: 'https://www.seikowatches.com/au-en/-/media/Seiko/Product/Prospex/SRP581K1/SRP581K1_1.png',
                brandId: seiko!.id,
                stockQuantity: 18,
                isAvailable: true,
            },
            {
                name: 'Rolex Milgauss',
                price: 8300.00,
                referenceCode: '116400GV',
                description: 'Anti-magnetic watch with a green sapphire crystal.',
                primaryPhotoUrl: 'https://content.rolex.com/v7/dam/watches/family-pages/milgauss/family_milgauss_m116400gv_0002_v1_3000px.jpg',
                brandId: rolex!.id,
                stockQuantity: 6,
                isAvailable: true,
            },
            {
                name: 'Patek Philippe Aquanaut',
                price: 22000.00,
                referenceCode: '5167A-001',
                description: 'Sporty luxury watch with a black dial.',
                primaryPhotoUrl: 'https://www.patek.com/images/watches/5167A_001.png',
                brandId: patek!.id,
                stockQuantity: 5,
                isAvailable: true,
            },
        ],
    });

    // Fetch created watches
    const watchesData = await prisma.watch.findMany();

    // Create Colors, Categories, Concepts, Materials associations
    const colors = await prisma.color.findMany();
    const categories = await prisma.category.findMany();
    const concepts = await prisma.concept.findMany();
    const materials = await prisma.material.findMany();

    // Assign attributes to watches
    await prisma.watchColor.createMany({
        data: [
            { watchId: watchesData[0].id, colorId: colors.find(c => c.name === 'Black')!.id }, // Submariner
            { watchId: watchesData[1].id, colorId: colors.find(c => c.name === 'Silver')!.id }, // Daytona
            { watchId: watchesData[2].id, colorId: colors.find(c => c.name === 'Black')!.id }, // Seamaster
            { watchId: watchesData[3].id, colorId: colors.find(c => c.name === 'Black')!.id }, // Speedmaster
            { watchId: watchesData[4].id, colorId: colors.find(c => c.name === 'Black')!.id }, // Prospex Turtle
            { watchId: watchesData[5].id, colorId: colors.find(c => c.name === 'Blue')!.id }, // Presage
            { watchId: watchesData[6].id, colorId: colors.find(c => c.name === 'Silver')!.id }, // Datejust
            { watchId: watchesData[7].id, colorId: colors.find(c => c.name === 'Silver')!.id }, // Constellation
            { watchId: watchesData[8].id, colorId: colors.find(c => c.name === 'Green')!.id }, // Astron
            { watchId: watchesData[9].id, colorId: colors.find(c => c.name === 'Black')!.id }, // Explorer
            { watchId: watchesData[10].id, colorId: colors.find(c => c.name === 'Blue')!.id }, // Nautilus
            { watchId: watchesData[11].id, colorId: colors.find(c => c.name === 'Blue')!.id }, // GMT-Master
            { watchId: watchesData[12].id, colorId: colors.find(c => c.name === 'Blue')!.id }, // Aqua Terra
            { watchId: watchesData[13].id, colorId: colors.find(c => c.name === 'Green')!.id }, // Alpinist
            { watchId: watchesData[14].id, colorId: colors.find(c => c.name === 'Silver')!.id }, // Calatrava
            { watchId: watchesData[15].id, colorId: colors.find(c => c.name === 'Silver')!.id }, // Yacht-Master
            { watchId: watchesData[16].id, colorId: colors.find(c => c.name === 'Silver')!.id }, // Globemaster
            { watchId: watchesData[17].id, colorId: colors.find(c => c.name === 'Black')!.id }, // Monster
            { watchId: watchesData[18].id, colorId: colors.find(c => c.name === 'Black')!.id }, // Milgauss
            { watchId: watchesData[19].id, colorId: colors.find(c => c.name === 'Black')!.id }, // Aquanaut
        ],
    });

    await prisma.watchCategory.createMany({
        data: [
            { watchId: watchesData[0].id, categoryId: categories.find(c => c.name === 'Dive Watch')!.id }, // Submariner
            { watchId: watchesData[1].id, categoryId: categories.find(c => c.name === 'Chronograph')!.id }, // Daytona
            { watchId: watchesData[2].id, categoryId: categories.find(c => c.name === 'Dive Watch')!.id }, // Seamaster
            { watchId: watchesData[3].id, categoryId: categories.find(c => c.name === 'Chronograph')!.id }, // Speedmaster
            { watchId: watchesData[4].id, categoryId: categories.find(c => c.name === 'Dive Watch')!.id }, // Prospex Turtle
            { watchId: watchesData[5].id, categoryId: categories.find(c => c.name === 'Dress Watch')!.id }, // Presage
            { watchId: watchesData[6].id, categoryId: categories.find(c => c.name === 'Dress Watch')!.id }, // Datejust
            { watchId: watchesData[7].id, categoryId: categories.find(c => c.name === 'Dress Watch')!.id }, // Constellation
            { watchId: watchesData[8].id, categoryId: categories.find(c => c.name === 'Chronograph')!.id }, // Astron
            { watchId: watchesData[9].id, categoryId: categories.find(c => c.name === 'Dive Watch')!.id }, // Explorer
            { watchId: watchesData[10].id, categoryId: categories.find(c => c.name === 'Chronograph')!.id }, // Nautilus
            { watchId: watchesData[11].id, categoryId: categories.find(c => c.name === 'Pilot Watch')!.id }, // GMT-Master
            { watchId: watchesData[12].id, categoryId: categories.find(c => c.name === 'Dress Watch')!.id }, // Aqua Terra
            { watchId: watchesData[13].id, categoryId: categories.find(c => c.name === 'Pilot Watch')!.id }, // Alpinist
            { watchId: watchesData[14].id, categoryId: categories.find(c => c.name === 'Dress Watch')!.id }, // Calatrava
            { watchId: watchesData[15].id, categoryId: categories.find(c => c.name === 'Dive Watch')!.id }, // Yacht-Master
            { watchId: watchesData[16].id, categoryId: categories.find(c => c.name === 'Dress Watch')!.id }, // Globemaster
            { watchId: watchesData[17].id, categoryId: categories.find(c => c.name === 'Dive Watch')!.id }, // Monster
            { watchId: watchesData[18].id, categoryId: categories.find(c => c.name === 'Chronograph')!.id }, // Milgauss
            { watchId: watchesData[19].id, categoryId: categories.find(c => c.name === 'Chronograph')!.id }, // Aquanaut
        ],
    });

    await prisma.watchConcept.createMany({
        data: [
            { watchId: watchesData[0].id, conceptId: concepts.find(c => c.name === 'Luxury')!.id }, // Submariner
            { watchId: watchesData[1].id, conceptId: concepts.find(c => c.name === 'Sport')!.id }, // Daytona
            { watchId: watchesData[2].id, conceptId: concepts.find(c => c.name === 'Sport')!.id }, // Seamaster
            { watchId: watchesData[3].id, conceptId: concepts.find(c => c.name === 'Vintage')!.id }, // Speedmaster
            { watchId: watchesData[4].id, conceptId: concepts.find(c => c.name === 'Sport')!.id }, // Prospex Turtle
            { watchId: watchesData[5].id, conceptId: concepts.find(c => c.name === 'Vintage')!.id }, // Presage
            { watchId: watchesData[6].id, conceptId: concepts.find(c => c.name === 'Luxury')!.id }, // Datejust
            { watchId: watchesData[7].id, conceptId: concepts.find(c => c.name === 'Luxury')!.id }, // Constellation
            { watchId: watchesData[8].id, conceptId: concepts.find(c => c.name === 'Modern')!.id }, // Astron
            { watchId: watchesData[9].id, conceptId: concepts.find(c => c.name === 'Sport')!.id }, // Explorer
            { watchId: watchesData[10].id, conceptId: concepts.find(c => c.name === 'Luxury')!.id }, // Nautilus
            { watchId: watchesData[11].id, conceptId: concepts.find(c => c.name === 'Sport')!.id }, // GMT-Master
            { watchId: watchesData[12].id, conceptId: concepts.find(c => c.name === 'Modern')!.id }, // Aqua Terra
            { watchId: watchesData[13].id, conceptId: concepts.find(c => c.name === 'Vintage')!.id }, // Alpinist
            { watchId: watchesData[14].id, conceptId: concepts.find(c => c.name === 'Luxury')!.id }, // Calatrava
            { watchId: watchesData[15].id, conceptId: concepts.find(c => c.name === 'Sport')!.id }, // Yacht-Master
            { watchId: watchesData[16].id, conceptId: concepts.find(c => c.name === 'Luxury')!.id }, // Globemaster
            { watchId: watchesData[17].id, conceptId: concepts.find(c => c.name === 'Sport')!.id }, // Monster
            { watchId: watchesData[18].id, conceptId: concepts.find(c => c.name === 'Modern')!.id }, // Milgauss
            { watchId: watchesData[19].id, conceptId: concepts.find(c => c.name === 'Sport')!.id }, // Aquanaut
        ],
    });

    await prisma.watchMaterial.createMany({
        data: [
            { watchId: watchesData[0].id, materialId: materials.find(m => m.name === 'Stainless Steel')!.id }, // Submariner
            { watchId: watchesData[1].id, materialId: materials.find(m => m.name === 'Ceramic')!.id }, // Daytona
            { watchId: watchesData[2].id, materialId: materials.find(m => m.name === 'Stainless Steel')!.id }, // Seamaster
            { watchId: watchesData[3].id, materialId: materials.find(m => m.name === 'Stainless Steel')!.id }, // Speedmaster
            { watchId: watchesData[4].id, materialId: materials.find(m => m.name === 'Stainless Steel')!.id }, // Prospex Turtle
            { watchId: watchesData[5].id, materialId: materials.find(m => m.name === 'Stainless Steel')!.id }, // Presage
            { watchId: watchesData[6].id, materialId: materials.find(m => m.name === 'Gold')!.id }, // Datejust
            { watchId: watchesData[7].id, materialId: materials.find(m => m.name === 'Gold')!.id }, // Constellation
            { watchId: watchesData[8].id, materialId: materials.find(m => m.name === 'Titanium')!.id }, // Astron
            { watchId: watchesData[9].id, materialId: materials.find(m => m.name === 'Stainless Steel')!.id }, // Explorer
            { watchId: watchesData[10].id, materialId: materials.find(m => m.name === 'Stainless Steel')!.id }, // Nautilus
            { watchId: watchesData[11].id, materialId: materials.find(m => m.name === 'Stainless Steel')!.id }, // GMT-Master
            { watchId: watchesData[12].id, materialId: materials.find(m => m.name === 'Stainless Steel')!.id }, // Aqua Terra
            { watchId: watchesData[13].id, materialId: materials.find(m => m.name === 'Stainless Steel')!.id }, // Alpinist
            { watchId: watchesData[14].id, materialId: materials.find(m => m.name === 'Gold')!.id }, // Calatrava
            { watchId: watchesData[15].id, materialId: materials.find(m => m.name === 'Stainless Steel')!.id }, // Yacht-Master
            { watchId: watchesData[16].id, materialId: materials.find(m => m.name === 'Gold')!.id }, // Globemaster
            { watchId: watchesData[17].id, materialId: materials.find(m => m.name === 'Stainless Steel')!.id }, // Monster
            { watchId: watchesData[18].id, materialId: materials.find(m => m.name === 'Stainless Steel')!.id }, // Milgauss
            { watchId: watchesData[19].id, materialId: materials.find(m => m.name === 'Stainless Steel')!.id }, // Aquanaut
        ],
    });

    // Create Watch Photos
    await prisma.watchPhoto.createMany({
        data: watchesData.map((w, i) => ({
            watchId: w.id,
            photoUrl: w.primaryPhotoUrl.replace('_v1_3000px.jpg', `_v1_3000px_${i + 1}.jpg`) || w.primaryPhotoUrl.replace('-a1.png', `-a${i + 1}.png`),
            altText: `${w.name} Side View`,
            order: 1,
        })),
    });

    // Create Watch Specification Headings and Points
    await prisma.watchSpecificationHeading.createMany({
        data: watchesData.map(w => ({
            watchId: w.id,
            heading: 'Technical Details',
            description: 'Key specifications of the watch.',
        })),
    });

    const headings = await prisma.watchSpecificationHeading.findMany();
    await prisma.watchSpecificationPoint.createMany({
        data: watchesData.map((w, i) => ({
            headingId: headings.find(h => h.watchId === w.id)!.id,
            label: 'Movement',
            value: i % 2 === 0 ? 'Automatic' : 'Quartz',
        })),
    });

    // Create Customers with wallet addresses
    await prisma.customer.createMany({
        data: [
            { pseudonym: 'JohnDoe123', walletAddress: '9mQ1z3Y4x5W6e7R8t9Y0u1I2o3P4a5S6d7F8g9H0j1K' },
            { pseudonym: 'JaneSmith456', walletAddress: '7kP2x3Y4z5W6r7T8u9I0o1P2a3S4d5F6g7H8j9K0m1N' },
        ],
    });

    // Fetch customers
    const john = await prisma.customer.findFirst({ where: { pseudonym: 'JohnDoe123' } });
    const jane = await prisma.customer.findFirst({ where: { pseudonym: 'JaneSmith456' } });

    // Create Bookings with CryptoPayment and update stock quantities
    await prisma.$transaction(async (prisma) => {
        // Booking 1: John buys 2 Submariners and 1 Seamaster with $100 discount
        const watchItems1 = [
            { watchId: watchesData[0].id, quantity: 2, unitPrice: 9500.00 }, // Submariner: 2 x $9500 = $19000
            { watchId: watchesData[2].id, quantity: 1, unitPrice: 5600.00 }, // Seamaster: 1 x $5600 = $5600
        ];
        const subtotal1 = watchItems1.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0); // $24600
        const discount1 = 100.00;
        const totalPrice1 = Math.max(0, subtotal1 - discount1); // $24500

        const booking1 = await prisma.booking.create({
            data: {
                customerId: john!.id,
                totalPrice: totalPrice1,
                discount: discount1,
                paymentStatus: 'CONFIRMING', // Updated to use new status
                shipmentStatus: 'PENDING',
                status: 'PENDING',
                shipmentAddress: '123 Main St, Lagos, Nigeria',
            },
        });

        await prisma.bookingWatch.createMany({
            data: watchItems1.map(item => ({
                bookingId: booking1.id,
                watchId: item.watchId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })),
        });

        // Create CryptoPayment for Booking 1
        await prisma.cryptoPayment.create({
            data: {
                bookingId: booking1.id,
                transactionHash: `tx_${Math.random().toString(36).substring(2, 15)}`,
                paymentType: 'SOL',
                amount: totalPrice1,
                usdValue: totalPrice1, // Assuming 1:1 conversion for simplicity
                senderWallet: john!.walletAddress!,
                receiverWallet: '8nQ2z3Y4x5W6e7R8t9Y0u1I2o3P4a5S6d7F8g9H0j2M',
                confirmations: 5,
                isConfirmed: false,
                blockTime: new Date(),
            },
        });

        // Update stock quantities for Booking 1
        for (const item of watchItems1) {
            await prisma.watch.update({
                where: { id: item.watchId },
                data: { stockQuantity: { decrement: item.quantity } },
            });
        }

        // Booking 2: Jane buys 1 Daytona and 2 Prospex with $50 discount
        const watchItems2 = [
            { watchId: watchesData[1].id, quantity: 1, unitPrice: 14000.00 }, // Daytona: 1 x $14000 = $14000
            { watchId: watchesData[4].id, quantity: 2, unitPrice: 450.00 }, // Prospex: 2 x $450 = $900
        ];
        const subtotal2 = watchItems2.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0); // $14900
        const discount2 = 50.00;
        const totalPrice2 = Math.max(0, subtotal2 - discount2); // $14850

        const booking2 = await prisma.booking.create({
            data: {
                customerId: jane!.id,
                totalPrice: totalPrice2,
                discount: discount2,
                paymentStatus: 'PAID',
                shipmentStatus: 'SHIPPED',
                status: 'CONFIRMED',
                shipmentAddress: '456 Broad St, Abuja, Nigeria',
            },
        });

        await prisma.bookingWatch.createMany({
            data: watchItems2.map(item => ({
                bookingId: booking2.id,
                watchId: item.watchId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })),
        });

        // Create CryptoPayment for Booking 2
        await prisma.cryptoPayment.create({
            data: {
                bookingId: booking2.id,
                transactionHash: `tx_${Math.random().toString(36).substring(2, 15)}`,
                paymentType: 'USDC',
                amount: totalPrice2,
                usdValue: totalPrice2, // Assuming 1:1 conversion for simplicity
                senderWallet: jane!.walletAddress!,
                receiverWallet: '8nQ2z3Y4x5W6e7R8t9Y0u1I2o3P4a5S6d7F8g9H0j2M',
                confirmations: 10,
                isConfirmed: true,
                blockTime: new Date(),
            },
        });

        // Update stock quantities for Booking 2
        for (const item of watchItems2) {
            await prisma.watch.update({
                where: { id: item.watchId },
                data: { stockQuantity: { decrement: item.quantity } },
            });
        }
    });

    console.log('Database seeded successfully with 20 watches!');
}

main()
    .catch(e => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });