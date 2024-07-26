import { DatasetList } from "../../components/DatasetList"
import './styles.css'
import { UploadDatasetButton } from '../../components/UploadDatasetButton';
import { UploadAvaliationButton } from '../../components/UploadAvaliationButton';





export const Home = () => {
    return (
        <div className="home flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-4xl font-bold mb-4">Stackfull</h1>
            <p className="text-xl mb-8">Welcome to Stackfull! Upload your dataset to get started.</p>
            <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
                <UploadDatasetButton />
            </div>
            <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
                <UploadAvaliationButton />
            </div>
        </div>
    );
}