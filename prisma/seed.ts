// prisma/seed.ts

import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, EventType, ArtifactStatus } from "../prisma/generated/client";
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding provenance database...");

  const creator = await prisma.creator.upsert({
    where: {
      name: "Your Mom",
    },
    update: {},
    create: {
      name: "Your Mom",
      bio: "Mixed-media paper artist creating one-of-a-kind handmade ephemera.",
    },
  });

  const collection = await prisma.collection.upsert({
    where: {
      slug: "found-correspondence-vol-1",
    },
    update: {},
    create: {
      slug: "found-correspondence-vol-1",
      title: "Found Correspondence — Volume I",
      description:
        "A collection of unique handmade paper artifacts inspired by forgotten letters, botanical specimens, and archival fragments.",
    },
  });

  const materials = [
    "Vintage Book Paper",
    "Tea Dyed Paper",
    "Pressed Flower",
    "Ribbon",
    "Lace",
    "Fabric",
    "Cotton Thread",
    "Brass Charm",
    "Resin",
    "Handmade Paper",
  ];

  for (const name of materials) {
    await prisma.material.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

const artifact = await prisma.artifact.upsert({
  where: {
    slug: "fc-001-botanical-envelope",
  },
  update: {},
  create: {
    slug: "fc-001-botanical-envelope",
    editionNo: "FC-001",
    title: "Botanical Envelope with Specimen",
    description:
      "One-of-one archival paper composition containing layered vintage papers, stitched textiles, pressed botanical specimens, and handmade ephemera.",
    status: ArtifactStatus.AVAILABLE,
    priceCents: 9500,
    currency: "USD",
    creator: { connect: { id: creator.id } },
    collection: { connect: { id: collection.id } },
    certificate: {
      create: {
        publicCode: "FC001-2026",
        statement: "This artifact is certified as a unique handmade original.",
      },
    },
  },
});

await prisma.artifactMaterial.deleteMany({
  where: { artifactId: artifact.id },
});

await prisma.artifactImage.deleteMany({
  where: { artifactId: artifact.id },
});

await prisma.provenanceEvent.deleteMany({
  where: { artifactId: artifact.id },
});

  const attachMaterial = async (name: string) => {
    const material = await prisma.material.findUniqueOrThrow({
      where: { name },
    });

    await prisma.artifactMaterial.create({
      data: {
        artifactId: artifact.id,
        materialId: material.id,
      },
    });
  };

  await attachMaterial("Vintage Book Paper");
  await attachMaterial("Pressed Flower");
  await attachMaterial("Ribbon");
  await attachMaterial("Lace");
  await attachMaterial("Cotton Thread");

  await prisma.artifactImage.createMany({
    data: [
      {
        artifactId: artifact.id,
        url: "/archive/fc001/main.jpg",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        artifactId: artifact.id,
        url: "/archive/fc001/detail-01.jpg",
        sortOrder: 1,
      },
      {
        artifactId: artifact.id,
        url: "/archive/fc001/detail-02.jpg",
        sortOrder: 2,
      },
    ],
  });

  await prisma.provenanceEvent.createMany({
    data: [
      {
        artifactId: artifact.id,

        type: EventType.CREATED,

        title: "Artifact Created",

        notes:
          "Constructed in the artist's home studio from reclaimed and archival materials.",

        actorName: creator.name,

        location: "Oklahoma",

        occurredAt: new Date("2026-02-18"),
      },
      {
        artifactId: artifact.id,

        type: EventType.CATALOGED,

        title: "Cataloged into Archive",

        notes:
          "Assigned edition FC-001 and entered into the provenance archive.",

        actorName: "Dallas Gaddis",

        occurredAt: new Date("2026-02-19"),
      },
      {
        artifactId: artifact.id,

        type: EventType.PHOTOGRAPHED,

        title: "Documented",

        notes:
          "Photographed under natural light for permanent archival record.",

        actorName: "Dallas Gaddis",

        occurredAt: new Date("2026-02-19"),
      },
      {
        artifactId: artifact.id,

        type: EventType.LISTED,

        title: "Published",

        notes:
          "Made available through the digital archive.",

        occurredAt: new Date("2026-02-20"),
      },
    ],
  });

  console.log("✅ Done");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
