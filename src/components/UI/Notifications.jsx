import { formatDistanceToNowStrict } from "date-fns";
import { IoMdClose } from "react-icons/io";
function Notifications({ isOpen, onClose, dataSet, onSeenNotification }) {
    const RelativeTime = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
        const relativeTime = formatDistanceToNowStrict(date, { addSuffix: true });
        return relativeTime;
    };
    return (
        <div
            className={`fixed inset-0 z-[999] flex justify-end pt-[6vh] bg-black bg-opacity-25 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            onClick={onClose}
        >
            <div
                className={`bg-white w-1/3  pt-2 transform transition-transform overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                style={{ maxHeight: "94vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between border-b px-5">
                    <h2 className="font-bold text-xl mb-4">Notifications</h2>
                    <button className="text-2xl mb-4" onClick={onClose}>
                        <IoMdClose size={24} />
                    </button>
                </div>
                <ul>
                    {dataSet.map((notification, index) => (
                        <li key={index} className={`py-2 px-3 border-b cursor-pointer hover:bg-blue-100  ${notification.seen ? "bg-white" : "bg-gray-100"}`} onClick={() => onSeenNotification(notification)}>
                            <div className="flex justify-between text-gray-500 text-sm ">
                                <p className="font-semibold">{notification.from}</p>
                                <p className=""> {RelativeTime(notification.date)}</p>
                            </div>
                            <p className="font-semibold">{notification.subject}</p>
                            <p>{notification.description}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Notifications