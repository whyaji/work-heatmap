import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  List,
  ListItem,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { FiBell, FiBriefcase, FiMapPin, FiRefreshCw, FiSmartphone, FiUser } from 'react-icons/fi';

export const Route = createFileRoute('/app-privacy-policy')({
  component: RouteComponent,
});

function RouteComponent() {
  const [lang, setLang] = useState<'en' | 'id'>('en');

  const textPrivacyPolicy = {
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated: 30 August 2025',
      description:
        'This Privacy Policy describes how CWA+ App or CBI Work Area Plus App ("we", "our", or "us") collects, uses, and shares your information when you use our mobile application.',

      // Introduction
      intro:
        'CWA+ App is a field worker coordination application that helps collect and manage location data for work assignments. By using our app, you agree to the collection and use of information in accordance with this policy.',

      // Information We Collect
      collectTitle: 'Information We Collect',
      collectLocation:
        'Location Data: We collect your precise location coordinates (GPS data) to track work assignments, monitor field activities, and ensure worker safety.',
      collectDevice:
        'Device Information: We collect device identifiers, operating system version, and app usage statistics.',
      collectPersonal:
        'Personal Information: We collect your name, employee ID, and contact information for account management.',
      collectWork:
        'Work Data: We collect information about your work assignments, time logs, and field activities.',

      // How We Use Information
      useTitle: 'How We Use Your Information',
      useLocation: 'Location tracking for work assignment management and safety monitoring',
      useCommunication: 'Sending notifications about work assignments and important updates',
      useAnalytics: 'Improving app performance and user experience',
      useSafety: 'Ensuring worker safety and emergency response coordination',

      // Permissions Required
      permissionsTitle: 'App Permissions Required',
      locationPermission:
        'Location Permission: Required to track your position for work assignments and safety purposes. This permission is essential for the core functionality of the app.',
      notificationPermission:
        'Notification Permission: Required to send you work-related updates, assignment notifications, and important alerts.',
      backgroundPermission:
        'Background Activity Permission: Required to continue location tracking and receive notifications even when the app is not actively in use. User can choose to disable location tracking in the app.',

      // Data Sharing
      sharingTitle: 'How We Share Your Information',
      sharingEmployer:
        'We share your location and work data with your employer or organization for work management purposes.',
      sharingService:
        'We may share data with third-party service providers who assist in app functionality, data storage, and analytics.',
      sharingLegal:
        'We may disclose information if required by law or to protect our rights and safety.',

      // Data Security
      securityTitle: 'Data Security',
      securityMeasures:
        'We implement appropriate security measures to protect your personal information, including encryption and secure data transmission.',

      // Data Retention
      retentionTitle: 'Data Retention',
      retentionPeriod:
        'We retain your data for as long as necessary to provide our services and comply with legal obligations.',

      // Your Rights
      rightsTitle: 'Your Rights',
      rightsAccess: 'You have the right to access, correct, or delete your personal information.',
      rightsOptOut: 'You can opt out of certain data collection by adjusting your device settings.',
      rightsContact: 'Contact us to exercise your rights or ask questions about this policy.',

      // Children's Privacy
      childrenTitle: "Children's Privacy",
      childrenContent:
        'Our app is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.',

      // Changes to Policy
      changesTitle: 'Changes to This Privacy Policy',
      changesContent:
        'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.',

      // Contact Information
      contactTitle: 'Contact Us',
      contactEmail: 'If you have any questions about this Privacy Policy, please contact us at:',

      // Language Toggle
      languageToggle: 'Language / Bahasa',
    },
    id: {
      title: 'Kebijakan Privasi',
      lastUpdated: 'Terakhir Diperbarui: 30 Agustus 2025',
      description:
        'Kebijakan Privasi ini menjelaskan bagaimana CWA+ App atau CBI Work Area Plus App ("kami", "kita", atau "kita") mengumpulkan, menggunakan, dan membagikan informasi Anda saat menggunakan aplikasi mobile kami.',

      // Introduction
      intro:
        'CWA+ App adalah aplikasi koordinasi pekerja lapangan yang membantu mengumpulkan dan mengelola data lokasi untuk penugasan kerja. Dengan menggunakan aplikasi kami, Anda setuju untuk pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini.',

      // Information We Collect
      collectTitle: 'Informasi yang Kami Kumpulkan',
      collectLocation:
        'Data Lokasi: Kami mengumpulkan koordinat lokasi Anda yang tepat (data GPS) untuk melacak penugasan kerja, memantau aktivitas lapangan, dan memastikan keselamatan pekerja.',
      collectDevice:
        'Informasi Perangkat: Kami mengumpulkan pengidentifikasi perangkat, versi sistem operasi, dan statistik penggunaan aplikasi.',
      collectPersonal:
        'Informasi Pribadi: Kami mengumpulkan nama, ID karyawan, dan informasi kontak untuk manajemen akun.',
      collectWork:
        'Data Kerja: Kami mengumpulkan informasi tentang penugasan kerja, log waktu, dan aktivitas lapangan.',

      // How We Use Information
      useTitle: 'Bagaimana Kami Menggunakan Informasi Anda',
      useLocation: 'Pelacakan lokasi untuk manajemen penugasan kerja dan pemantauan keselamatan',
      useCommunication: 'Mengirim notifikasi tentang penugasan kerja dan pembaruan penting',
      useAnalytics: 'Meningkatkan kinerja aplikasi dan pengalaman pengguna',
      useSafety: 'Memastikan keselamatan pekerja dan koordinasi respons darurat',

      // Permissions Required
      permissionsTitle: 'Izin Aplikasi yang Diperlukan',
      locationPermission:
        'Izin Lokasi: Diperlukan untuk melacak posisi Anda untuk penugasan kerja dan tujuan keselamatan. Izin ini sangat penting untuk fungsi utama aplikasi.',
      notificationPermission:
        'Izin Notifikasi: Diperlukan untuk mengirim pembaruan terkait kerja, notifikasi penugasan, dan peringatan penting.',
      backgroundPermission:
        'Izin Aktivitas Latar Belakang: Diperlukan untuk melanjutkan pelacakan lokasi dan menerima notifikasi bahkan ketika aplikasi tidak aktif digunakan. Pengguna dapat memilih untuk menonaktifkan pelacakan lokasi di aplikasi.',

      // Data Sharing
      sharingTitle: 'Bagaimana Kami Membagikan Informasi Anda',
      sharingEmployer:
        'Kami membagikan data lokasi dan kerja Anda dengan pemberi kerja atau organisasi Anda untuk tujuan manajemen kerja.',
      sharingService:
        'Kami dapat membagikan data dengan penyedia layanan pihak ketiga yang membantu dalam fungsi aplikasi, penyimpanan data, dan analitik.',
      sharingLegal:
        'Kami dapat mengungkapkan informasi jika diperlukan oleh hukum atau untuk melindungi hak dan keselamatan kami.',

      // Data Security
      securityTitle: 'Keamanan Data',
      securityMeasures:
        'Kami menerapkan langkah-langkah keamanan yang tepat untuk melindungi informasi pribadi Anda, termasuk enkripsi dan transmisi data yang aman.',

      // Data Retention
      retentionTitle: 'Retensi Data',
      retentionPeriod:
        'Kami menyimpan data Anda selama diperlukan untuk menyediakan layanan kami dan mematuhi kewajiban hukum.',

      // Your Rights
      rightsTitle: 'Hak Anda',
      rightsAccess:
        'Anda memiliki hak untuk mengakses, memperbaiki, atau menghapus informasi pribadi Anda.',
      rightsOptOut:
        'Anda dapat memilih keluar dari pengumpulan data tertentu dengan menyesuaikan pengaturan perangkat Anda.',
      rightsContact:
        'Hubungi kami untuk menggunakan hak Anda atau mengajukan pertanyaan tentang kebijakan ini.',

      // Children's Privacy
      childrenTitle: 'Privasi Anak-anak',
      childrenContent:
        'Aplikasi kami tidak ditujukan untuk anak-anak di bawah 13 tahun. Kami tidak secara sadar mengumpulkan informasi pribadi dari anak-anak di bawah 13 tahun.',

      // Changes to Policy
      changesTitle: 'Perubahan pada Kebijakan Privasi Ini',
      changesContent:
        'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan dengan memposting Kebijakan Privasi baru di halaman ini.',

      // Contact Information
      contactTitle: 'Hubungi Kami',
      contactEmail:
        'Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di:',

      // Language Toggle
      languageToggle: 'Language / Bahasa',
    },
  };

  const contactEmailValue = import.meta.env.VITE_PP_CONTACT_MAIL || 'privacypolicy@cwaplus.com';
  const contactAddress = import.meta.env.VITE_PP_CONTACT_ADDRESS || 'CWA+ App Team';

  const currentText = { ...textPrivacyPolicy[lang], contactEmailValue, contactAddress };

  const bgColor = useColorModeValue(
    'linear(to-br, purple.900, blue.900)',
    'linear(to-br, purple.900, blue.900)'
  );
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)');
  const textColor = useColorModeValue('white', 'gray.100');
  const headingColor = useColorModeValue('blue.100', 'blue.200');
  const borderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');
  const accentColor = useColorModeValue('blue.300', 'blue.400');

  const HeaderView = () => (
    <Flex
      align="center"
      justify="space-between"
      mb={8}
      p={{ base: 3, md: 4 }}
      bg={cardBg}
      borderRadius="2xl"
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(10px)"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
      flexWrap={{ base: 'wrap', lg: 'nowrap' }}
      gap={{ base: 3, md: 4 }}>
      {/* Logo and Title Section */}
      <Flex
        align="center"
        minW={{ base: 'auto', md: '300px' }}
        flex={{ base: '1 1 100%', lg: '0 0 auto' }}
        justify={{ base: 'center', lg: 'flex-start' }}
        order={{ base: 1, lg: 1 }}>
        <Link to="/">
          <Image
            src="/cwa-logo.jpeg"
            alt="CWA+ Logo"
            borderRadius="xl"
            boxSize={{ base: 10, md: 12 }}
          />
        </Link>

        <Text
          fontSize={{ base: 'lg', md: '2xl' }}
          fontWeight="bold"
          px={{ base: 2, md: 4 }}
          color="white"
          textAlign={{ base: 'center', lg: 'left' }}
          noOfLines={{ base: 2, md: 1 }}
          lineHeight="shorter">
          CWA+ CBI Work Area Plus
        </Text>
      </Flex>

      {/* Language Selector Section */}
      <HStack
        spacing={{ base: 2, md: 4 }}
        flex={{ base: '1 1 100%', lg: '0 0 auto' }}
        justify={{ base: 'center', lg: 'flex-end' }}
        order={{ base: 2, lg: 2 }}>
        <Button
          variant={lang === 'en' ? 'solid' : 'ghost'}
          bg={lang === 'en' ? 'blue.500' : 'transparent'}
          color={lang === 'en' ? 'white' : textColor}
          _hover={{
            bg: lang === 'en' ? 'blue.600' : 'rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-2px)',
          }}
          _active={{
            transform: 'translateY(0)',
          }}
          borderRadius="xl"
          px={{ base: 3, md: 6 }}
          py={{ base: 2, md: 3 }}
          fontWeight="bold"
          transition="all 0.3s ease"
          onClick={() => setLang('en')}
          leftIcon={<Text fontSize={{ base: 'sm', md: 'lg' }}>🇬🇧</Text>}
          size={{ base: 'sm', md: 'md' }}
          fontSize={{ base: 'sm', md: 'md' }}>
          English
        </Button>

        <Box
          w="2px"
          h={{ base: '4', md: '6' }}
          bg={borderColor}
          borderRadius="full"
          display={{ base: 'none', sm: 'block' }}
        />

        <Button
          variant={lang === 'id' ? 'solid' : 'ghost'}
          bg={lang === 'id' ? 'blue.500' : 'transparent'}
          color={lang === 'id' ? 'white' : textColor}
          _hover={{
            bg: lang === 'id' ? 'blue.600' : 'rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-2px)',
          }}
          _active={{
            transform: 'translateY(0)',
          }}
          borderRadius="xl"
          px={{ base: 3, md: 6 }}
          py={{ base: 2, md: 3 }}
          fontWeight="bold"
          transition="all 0.3s ease"
          onClick={() => setLang('id')}
          leftIcon={<Text fontSize={{ base: 'sm', md: 'lg' }}>🇮🇩</Text>}
          size={{ base: 'sm', md: 'md' }}
          fontSize={{ base: 'sm', md: 'md' }}>
          Bahasa
        </Button>
      </HStack>
    </Flex>
  );

  const SectionCard = ({ children }: { children: React.ReactNode }) => (
    <Box
      bg={cardBg}
      borderRadius="2xl"
      p={8}
      mb={6}
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(10px)"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.2)"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
      }}>
      {children}
    </Box>
  );

  return (
    <Box
      bgGradient={bgColor}
      minH="100vh"
      py={8}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgImage:
          'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(56, 178, 172, 0.3) 0%, transparent 50%)',
        pointerEvents: 'none',
      }}>
      <Container maxW="4xl" position="relative" zIndex={1}>
        <HeaderView />

        {/* Header */}
        <SectionCard>
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h1"
              size="3xl"
              color={headingColor}
              bgGradient="linear(to-r, blue.200, purple.200)"
              bgClip="text"
              fontWeight="extrabold">
              {currentText.title}
            </Heading>
            <Text color={accentColor} fontSize="lg" fontWeight="medium">
              {currentText.lastUpdated}
            </Text>
          </VStack>
        </SectionCard>

        {/* Description */}
        <SectionCard>
          <Text color={textColor} fontSize="lg" lineHeight="tall">
            {currentText.description}
          </Text>
        </SectionCard>

        {/* Introduction */}
        <SectionCard>
          <Text color={textColor} fontSize="lg" lineHeight="tall">
            {currentText.intro}
          </Text>
        </SectionCard>

        {/* Information We Collect */}
        <SectionCard>
          <Heading as="h2" size="xl" color={headingColor} mb={6}>
            {currentText.collectTitle}
          </Heading>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4} align="flex-start">
              <Box color={accentColor} mt={1}>
                <FiMapPin size={24} />
              </Box>
              <Text color={textColor} fontSize="md" lineHeight="tall">
                {currentText.collectLocation}
              </Text>
            </HStack>
            <HStack spacing={4} align="flex-start">
              <Box color={accentColor} mt={1}>
                <FiSmartphone size={24} />
              </Box>
              <Text color={textColor} fontSize="md" lineHeight="tall">
                {currentText.collectDevice}
              </Text>
            </HStack>
            <HStack spacing={4} align="flex-start">
              <Box color={accentColor} mt={1}>
                <FiUser size={24} />
              </Box>
              <Text color={textColor} fontSize="md" lineHeight="tall">
                {currentText.collectPersonal}
              </Text>
            </HStack>
            <HStack spacing={4} align="flex-start">
              <Box color={accentColor} mt={1}>
                <FiBriefcase size={24} />
              </Box>
              <Text color={textColor} fontSize="md" lineHeight="tall">
                {currentText.collectWork}
              </Text>
            </HStack>
          </VStack>
        </SectionCard>

        {/* How We Use Information */}
        <SectionCard>
          <Heading as="h2" size="xl" color={headingColor} mb={6}>
            {currentText.useTitle}
          </Heading>
          <List spacing={3}>
            <ListItem color={textColor} fontSize="md" lineHeight="tall">
              {currentText.useLocation}
            </ListItem>
            <ListItem color={textColor} fontSize="md" lineHeight="tall">
              {currentText.useCommunication}
            </ListItem>
            <ListItem color={textColor} fontSize="md" lineHeight="tall">
              {currentText.useAnalytics}
            </ListItem>
            <ListItem color={textColor} fontSize="md" lineHeight="tall">
              {currentText.useSafety}
            </ListItem>
          </List>
        </SectionCard>

        {/* Permissions Required */}
        <SectionCard>
          <Heading as="h2" size="xl" color={headingColor} mb={6}>
            {currentText.permissionsTitle}
          </Heading>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4} align="flex-start">
              <Box color={accentColor} mt={1}>
                <FiMapPin size={24} />
              </Box>
              <Text color={textColor} fontSize="md" lineHeight="tall">
                {currentText.locationPermission}
              </Text>
            </HStack>
            <HStack spacing={4} align="flex-start">
              <Box color={accentColor} mt={1}>
                <FiBell size={24} />
              </Box>
              <Text color={textColor} fontSize="md" lineHeight="tall">
                {currentText.notificationPermission}
              </Text>
            </HStack>
            <HStack spacing={4} align="flex-start">
              <Box color={accentColor} mt={1}>
                <FiRefreshCw size={24} />
              </Box>
              <Text color={textColor} fontSize="md" lineHeight="tall">
                {currentText.backgroundPermission}
              </Text>
            </HStack>
          </VStack>
        </SectionCard>

        {/* Data Sharing */}
        <SectionCard>
          <Heading as="h2" size="xl" color={headingColor} mb={6}>
            {currentText.sharingTitle}
          </Heading>
          <List spacing={3}>
            <ListItem color={textColor} fontSize="md" lineHeight="tall">
              {currentText.sharingEmployer}
            </ListItem>
            <ListItem color={textColor} fontSize="md" lineHeight="tall">
              {currentText.sharingService}
            </ListItem>
            <ListItem color={textColor} fontSize="md" lineHeight="tall">
              {currentText.sharingLegal}
            </ListItem>
          </List>
        </SectionCard>

        {/* Data Security */}
        <SectionCard>
          <Heading as="h2" size="xl" color={headingColor} mb={6}>
            {currentText.securityTitle}
          </Heading>
          <Text color={textColor} fontSize="md" lineHeight="tall">
            {currentText.securityMeasures}
          </Text>
        </SectionCard>

        {/* Data Retention */}
        <SectionCard>
          <Heading as="h2" size="xl" color={headingColor} mb={6}>
            {currentText.retentionTitle}
          </Heading>
          <Text color={textColor} fontSize="md" lineHeight="tall">
            {currentText.retentionPeriod}
          </Text>
        </SectionCard>

        {/* Your Rights */}
        <SectionCard>
          <Heading as="h2" size="xl" color={headingColor} mb={6}>
            {currentText.rightsTitle}
          </Heading>
          <List spacing={3}>
            <ListItem color={textColor} fontSize="md" lineHeight="tall">
              {currentText.rightsAccess}
            </ListItem>
            <ListItem color={textColor} fontSize="md" lineHeight="tall">
              {currentText.rightsOptOut}
            </ListItem>
            <ListItem color={textColor} fontSize="md" lineHeight="tall">
              {currentText.rightsContact}
            </ListItem>
          </List>
        </SectionCard>

        {/* Children's Privacy */}
        <SectionCard>
          <Heading as="h2" size="xl" color={headingColor} mb={6}>
            {currentText.childrenTitle}
          </Heading>
          <Text color={textColor} fontSize="md" lineHeight="tall">
            {currentText.childrenContent}
          </Text>
        </SectionCard>

        {/* Changes to Policy */}
        <SectionCard>
          <Heading as="h2" size="xl" color={headingColor} mb={6}>
            {currentText.changesTitle}
          </Heading>
          <Text color={textColor} fontSize="md" lineHeight="tall">
            {currentText.changesContent}
          </Text>
        </SectionCard>

        {/* Contact Information */}
        <SectionCard>
          <Heading as="h2" size="xl" color={headingColor} mb={6}>
            {currentText.contactTitle}
          </Heading>
          <VStack spacing={3} align="flex-start">
            <Text color={textColor} fontSize="md">
              {currentText.contactEmail}
            </Text>
            <Text color={accentColor} fontSize="lg" fontWeight="bold">
              {currentText.contactEmailValue}
            </Text>
            <Text color={textColor} fontSize="md">
              {currentText.contactAddress}
            </Text>
          </VStack>
        </SectionCard>

        {/* Footer */}
        <Box>
          <Divider borderColor={borderColor} my={8} />
          <Box textAlign="center">
            <Text color="rgba(255, 255, 255, 0.6)" fontSize="sm">
              © 2025 CWA+ App. All rights reserved.
            </Text>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
