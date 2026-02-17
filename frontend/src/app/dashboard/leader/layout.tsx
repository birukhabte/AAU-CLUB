import LeaderSidebar from '@/components/layout/LeaderSidebar';

export default function LeaderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <LeaderSidebar />
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
