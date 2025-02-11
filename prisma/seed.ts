import { PrismaClient } from '@prisma/client';
import { ObjectId } from 'bson'; // For generating valid MongoDB ObjectIds
import bcrypt from 'bcryptjs'; // For hashing passwords

const prisma = new PrismaClient();

async function main() {
  // Create users
  const user1 = await prisma.user.create({
    data: {
      id: new ObjectId().toString(),
      name: 'Alice Johnson',
      email: 'alice@example.com',
      hashedPassword: await bcrypt.hash('password1', 10),
      image: 'https://example.com/alice.jpg',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: new ObjectId().toString(),
      name: 'Bob Smith',
      email: 'bob@example.com',
      hashedPassword: await bcrypt.hash('password2', 10),
      image: 'https://example.com/bob.jpg',
    },
  });

  // Create a conversation between Alice and Bob
  const conversation = await prisma.conversation.create({
    data: {
      id: new ObjectId().toString(),
      isGroup: false,
      users: {
        connect: [
          { id: user1.id }, // Connect Alice
          { id: user2.id }, // Connect Bob
        ],
      },
    },
  });

  // Create messages in the conversation
  const message1 = await prisma.message.create({
    data: {
      id: new ObjectId().toString(),
      body: 'Hi Bob!',
      sender: { connect: { id: user1.id } }, // Message sent by Alice
      conversation: { connect: { id: conversation.id } },
    },
  });

  const message2 = await prisma.message.create({
    data: {
      id: new ObjectId().toString(),
      body: 'Hey Alice!',
      sender: { connect: { id: user2.id } }, // Message sent by Bob
      conversation: { connect: { id: conversation.id } },
      seen: {
        connect: [{ id: user1.id }], // Seen by Alice
      },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
