const { execSync } = require('child_process');

if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Development: Running db push and seed...');
    execSync('prisma db push', { stdio: 'inherit' });
    execSync('prisma db seed', { stdio: 'inherit' });
} else {
    console.log('🏭 Production: Skipping db push and seed');
}